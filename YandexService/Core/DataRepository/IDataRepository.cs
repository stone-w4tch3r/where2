using YandexService.API.DataTypes.Abstractions;

namespace YandexService.Core.DataRepository;

internal interface IDataRepository<T>
    where T : SavableRecord, IDataType
{
    public Task<T> GetData(FileInfo fileInfo);
}