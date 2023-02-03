using System.Text.Json.Serialization;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public partial record StationScheduleDto
{
    public record StationDto : IDto
    {
        public string? Type { get; init; }
        
        public string? Title { get; init; }
        
        [JsonPropertyName("short_title")]
        public string? ShortTitle { get; init; }
        
        [JsonPropertyName("popular_title")]
        public object? PopularTitle { get; init; }
        
        public string? Code { get; init; }
        [JsonPropertyName("station_type")]
        public string? StationType { get; init; }
        
        [JsonPropertyName("station_type_name")]
        public string? StationTypeName { get; init; }
        
        [JsonPropertyName("transport_type")]
        public string? TransportType { get; init; }
    }
}