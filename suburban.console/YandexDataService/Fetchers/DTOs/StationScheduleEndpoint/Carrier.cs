using suburban.console.DataTypes;
using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public record Carrier : IDto
{
    public int? Code { get; init; }
    public string? Title { get; init; }
    public Codes? Codes { get; init; }
}