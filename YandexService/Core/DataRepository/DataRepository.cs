// using System.Data;
// using System.Diagnostics.CodeAnalysis;
// using suburban.essentials;
// using suburban.essentials.Extensions;
// using suburban.essentials.HelperServices;
// using suburban.shared;
// using YandexService.API.DataTypes.Abstractions;
//
// namespace suburban.console.YandexDataService.DataRepository;
//
// internal class DataRepository<T> : IDataRepository<T>
//     where T : SavableRecord, IDataType
// {
//     private readonly IDataFetcher<T> _dataFetcher;
//     private readonly IFileService _fileService;
//
//     public DataRepository(IFileService fileService, Func<Task<Result<TDto>>, Func<TEndpoint>> dataFetcher)
//     {
//         _fileService = fileService;
//         _dataFetcher = dataFetcher;
//     }
//
//     public async Task<T> GetData(FileInfo fileInfo) => await
//         (await _fileService.LoadFromFile<T>(fileInfo).ConfigureAwait(false))
//         .Map(async loadedData =>
//             LoadedDataIsValid(loadedData)
//                 ? loadedData.TapLog(StringResources.Debug.DataIsActual)
//                 : (await FetchDataOrReturnLoaded(loadedData).ConfigureAwait(false))
//                     .Tap(data => SaveLoadedDataToFile(data, fileInfo)))
//         .ConfigureAwait(false);
//
//     private static bool LoadedDataIsValid([NotNullWhen(true)] T? dataType) =>
//         dataType is { }
//         && true.TapLog(StringResources.Debug.StationsLoadedFromCache, dataType.CreationTime)
//         && dataType.CreationTime > DateTime.Now.AddDays(-1);
//
//     private async Task<T> FetchDataOrReturnLoaded(T? loadedData) =>
//         (await _dataFetcher.TryFetchData().ConfigureAwait(false))
//         .TapLog(StringResources.Debug.DataIsNotValidFetching)
//             is { IsSuccess: true } dataFetchResult
//             ? dataFetchResult.Value.TapLog(StringResources.Debug.DataFetched)
//             : loadedData ?? throw new DataException(StringResources.Exceptions.FetchingAndLoadingFailed);
//
//     private async void SaveLoadedDataToFile(T dataType, FileInfo fileInfo) =>
//         await _fileService.SaveToFile(dataType, fileInfo).ConfigureAwait(false);
// }
