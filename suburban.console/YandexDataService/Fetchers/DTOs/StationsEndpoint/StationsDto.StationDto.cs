using System.Text.Json.Serialization;
using suburban.essentials;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

// ReSharper disable UnusedAutoPropertyAccessor.Global - json deserialization
public partial record StationsDto
{
    public record StationDto : IDto
    {
        public string? Direction { get; init; }
    
        public CodesDto? Codes { get; init; }
    
        [JsonPropertyName("station_type")]
        public string? StationType { get; init; }
    
        public string? Title { get; init; }
    
        [JsonConverter(typeof(NullableDoubleConverter))]
        public double? Longitude { get; init; }
    
        [JsonPropertyName("transport_type")]
        public string? TransportType { get; init; }
    
        [JsonConverter(typeof(NullableDoubleConverter))]
        public double? Latitude { get; init; }
    }
}