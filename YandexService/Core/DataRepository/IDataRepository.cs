using YandexService.API.DataTypes.Abstractions;

namespace YandexService.Core.DataRepository;

public interface IDataRepository<T>
    where T : SavableRecord, IDataType
{
    public Task<T> GetData(FileInfo fileInfo);
}