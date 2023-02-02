namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public partial record StationsDto(IEnumerable<CountryDto>? Countries) : IDto;