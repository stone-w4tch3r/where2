using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public class Thread : IDto
{
    public string? Number { get; init; }
    public string? Title { get; init; }
    public string? ShortTitle { get; init; }
    public string? ExpressType { get; init; }
    public string? TransportType { get; init; }
    public Carrier? Carrier { get; init; }
    public string? Uid { get; init; }
    public object? Vehicle { get; init; }
    public TransportSubtype? TransportSubtype { get; init; }
}