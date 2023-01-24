using System.Data;
using suburban.console.DataTypes;
using suburban.console.Extensions;
using suburban.console.HelperServices;
using suburban.console.YandexDataService.Fetchers;
using suburban.essentials;
using suburban.shared;

namespace suburban.console.YandexDataService.DataRepository;

public class DataRepository<T> : IDataRepository<T>
    where T : SavableRecord, IDataType
{
    private readonly IFileService _fileService;
    private readonly IDataFetcher<T> _dataFetcher;
    
    public DataRepository(IFileService fileService, IDataFetcher<T> dataFetcher)
    {
        _fileService = fileService;
        _dataFetcher = dataFetcher;
    }

    public async Task<T> GetDataType(FileInfo fileInfo)
    {
        return await (await _fileService.LoadFromFile<T>(fileInfo).ConfigureAwait(false))
            .Map(async dataType =>
                dataType is { }
                && true.TapLog(StringResources.Debug.StationsLoadedFromCache, dataType.CreationTime)
                && dataType.CreationTime > DateTime.Now.AddDays(-1)
                    ? dataType.TapLog(StringResources.Debug.DataIsActual)
                    : await _dataFetcher.TryFetchData().ConfigureAwait(false)
                        is { IsSuccess: true } dataFetchResult
                        ? dataFetchResult.Value.Tap(SaveLoadedDataToFile)
                        : dataType ?? throw new DataException(StringResources.Exceptions.FetchingAndLoadingFailed))
            .ConfigureAwait(false);

        async void SaveLoadedDataToFile(T dataType) =>
            await _fileService.SaveToFile(dataType, fileInfo).ConfigureAwait(false);
    }
}