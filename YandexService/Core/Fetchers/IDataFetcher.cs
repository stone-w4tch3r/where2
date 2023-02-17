using suburban.essentials;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers;

public interface IDataFetcher<TDto> where TDto : IDto
{
    public Task<Result<TDto>> TryFetchData();
}