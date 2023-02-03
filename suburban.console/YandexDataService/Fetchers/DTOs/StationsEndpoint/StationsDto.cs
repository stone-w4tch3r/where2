namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public partial record StationsDto : IDto
{
    public IEnumerable<CountryDto>? Countries { get; init; }
}