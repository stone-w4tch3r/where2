using suburban.console.DataTypes;
using suburban.console.YandexDataService.DataRepository;

namespace suburban.console.YandexDataService;

public class YandexDataService<T>
where T : SavableRecord, IDataType
{
    private readonly IDataRepository<T> _dataRepository;
    
    public YandexDataService(IDataRepository<T> dataRepository)
    {
        _dataRepository = dataRepository;
    }

    public async Task<T> GetData(FileInfo fileInfo) =>
        await _dataRepository.GetDataType(fileInfo).ConfigureAwait(false);
}