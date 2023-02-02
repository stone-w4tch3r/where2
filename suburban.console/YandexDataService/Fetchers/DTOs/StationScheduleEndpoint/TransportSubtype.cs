using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public class TransportSubtype : IDto
{
    public string? Title { get; init; }
    public string? Code { get; init; }
    public string? Color { get; init; }
}