namespace YandexService.Core.Fetchers.DTOs;

internal record StationsDto(IEnumerable<CountryDto>? Countries) : IDto;