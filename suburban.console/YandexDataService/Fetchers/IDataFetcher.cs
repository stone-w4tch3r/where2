using suburban.console.DataTypes;
using suburban.console.DataTypes.Abstractions;
using suburban.essentials;

namespace suburban.console.YandexDataService.Fetchers;

public interface IDataFetcher<TDataType> where TDataType : IDataType
{
    public Task<Result<TDataType>> TryFetchData();
}