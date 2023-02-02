using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public record ScheduleDirection : IDto
{
    public string? Code { get; init; }
    public string? Title { get; init; }
}