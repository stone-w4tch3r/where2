namespace YandexService.Core.Fetchers.DTOs;

public record StationsDto(IEnumerable<CountryDto>? Countries) : IDto;