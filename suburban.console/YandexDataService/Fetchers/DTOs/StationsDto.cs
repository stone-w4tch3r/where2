namespace suburban.console.YandexDataService.Fetchers.DTOs;

public record StationsDto(IEnumerable<CountryDto>? Countries) : IDto;