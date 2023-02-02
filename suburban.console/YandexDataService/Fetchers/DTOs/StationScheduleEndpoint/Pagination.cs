using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public record Pagination : IDto
{
    public int Total { get; init; }
    public int Limit { get; init; }
    public int Offset { get; init; }
}