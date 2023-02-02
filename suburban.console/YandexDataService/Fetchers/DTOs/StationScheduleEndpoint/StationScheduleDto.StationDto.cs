using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public partial record StationScheduleDto
{
    public record StationDto : IDto
    {
        public string? Type { get; init; }
        public string? Title { get; init; }
        public string? ShortTitle { get; init; }
        public object? PopularTitle { get; init; }
        public string? Code { get; init; }
        public string? StationType { get; init; }
        public string? StationTypeName { get; init; }
        public string? TransportType { get; init; }
    }
}