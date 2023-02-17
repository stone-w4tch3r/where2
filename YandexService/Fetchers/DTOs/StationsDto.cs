namespace YandexService.Fetchers.DTOs;

public record StationsDto(IEnumerable<CountryDto>? Countries) : IDto;