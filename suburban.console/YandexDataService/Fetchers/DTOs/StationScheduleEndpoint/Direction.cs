namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public record Direction : IDto
{
    public string? Code { get; init; }
    public string? Title { get; init; }
}