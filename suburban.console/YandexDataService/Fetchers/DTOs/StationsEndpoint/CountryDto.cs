namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public record CountryDto : IDto
{
    public IEnumerable<RegionDto>? Regions { get; init; }
    public CodesDto? Codes { get; init; }
    public string? Title { get; init; }
}