using suburban.console.YandexDataService.Fetchers.DTOs;
using suburban.essentials;

namespace suburban.console.YandexDataService.Fetchers;

public interface IDataFetcher<TDto> where TDto : IDto
{
    public Task<Result<TDto>> TryFetchData();
}