using suburban.console.DataTypes;

namespace suburban.console.YandexDataService.DataRepository;

public interface IDataRepository<T>
    where T : SavableRecord, IDataType
{
    public Task<T> GetDataType(FileInfo fileInfo);
}