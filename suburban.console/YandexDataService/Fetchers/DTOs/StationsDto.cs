namespace suburban.console.YandexDataService.Fetchers.DTOs;

public partial record StationsDto(IEnumerable<CountryDto>? Countries) : IDto;