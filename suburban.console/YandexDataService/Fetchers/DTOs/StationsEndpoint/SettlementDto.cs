namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public record SettlementDto : IDto
{
    public string? Title { get; init; }
    public CodesDto? Codes { get; init; }
    public IEnumerable<StationsDto.StationDto>? Stations { get; init; }
}