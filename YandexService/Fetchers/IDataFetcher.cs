using suburban.essentials;
using YandexService.Fetchers.DTOs;

namespace YandexService.Fetchers;

public interface IDataFetcher<TDto> where TDto : IDto
{
    public Task<Result<TDto>> TryFetchData();
}