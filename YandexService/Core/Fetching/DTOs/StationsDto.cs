namespace YandexService.Core.Fetching.DTOs;

internal record StationsDto(IEnumerable<CountryDto>? Countries) : IDto;