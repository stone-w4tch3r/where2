using YandexService.DataTypes.Abstractions;

namespace YandexService.DataRepository;

public interface IDataRepository<T>
    where T : SavableRecord, IDataType
{
    public Task<T> GetData(FileInfo fileInfo);
}