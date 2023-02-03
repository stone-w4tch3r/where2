using suburban.console.DataTypes.Abstractions;

namespace suburban.console.YandexDataService.DataRepository;

public interface IDataRepository<T>
    where T : SavableRecord, IDataType
{
    public Task<T> GetData(FileInfo fileInfo);
}