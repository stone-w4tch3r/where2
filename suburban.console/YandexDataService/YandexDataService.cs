using suburban.console.DataTypes;
using suburban.console.Extensions;
using suburban.console.HelperServices;
using suburban.console.YandexDataService.DataRepository;
using suburban.shared;

namespace suburban.console.YandexDataService;

public class YandexDataService<T>
where T : SavableRecord, IDataType
{
    private readonly IFileService _fileService;
    private readonly IDataRepository<T> _dataRepository;
    
    public YandexDataService(IFileService fileService, IDataRepository<T> dataRepository)
    {
        _fileService = fileService;
        _dataRepository = dataRepository;
    }

    public async Task<T> GetData(FileInfo fileInfo) =>
        (await _dataRepository.GetDataType(fileInfo).ConfigureAwait(false))
        .LogToFile(_fileService, FileResources.Debug.FilteredStations);
}