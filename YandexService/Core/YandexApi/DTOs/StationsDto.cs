namespace YandexService.Core.YandexApi.DTOs;

internal record StationsDto(IEnumerable<CountryDto>? Countries) : IDto;