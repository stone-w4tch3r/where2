namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public record RegionDto : IDto
{
    public IEnumerable<SettlementDto>? Settlements { get; init; }
    public CodesDto? Codes { get; init; }
    public string? Title { get; init; }
}