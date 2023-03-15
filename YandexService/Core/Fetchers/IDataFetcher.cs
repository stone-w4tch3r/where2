using suburban.essentials;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers;

internal interface IDataFetcher<TDto> where TDto : IDto
{
    public Task<Result<TDto>> TryFetchData();
}