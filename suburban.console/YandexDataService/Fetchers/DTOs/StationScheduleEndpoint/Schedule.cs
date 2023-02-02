using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public record Schedule : IDto
{
    public Thread? Thread { get; init; }
    public bool? IsFuzzy { get; init; }
    public string? Platform { get; init; }
    public object? Terminal { get; init; }
    public string? Days { get; init; }
    public object? ExceptDays { get; init; }
    public string? Stops { get; init; }
    public string? Direction { get; init; }
    public string? Departure { get; init; }
    public string? Arrival { get; init; }
}