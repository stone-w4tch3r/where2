using System.Text.Json.Serialization;
using suburban.essentials;

namespace suburban.console.YandexDataService.Fetchers.DTOs;

public record StationDto : IDto
{
    // ReSharper disable once ConvertToPrimaryConstructor
    public StationDto(
        string? direction,
        CodesDto? codes, 
        string? stationType,
        string? title, 
        double? longitude, 
        string? transportType, 
        double? latitude)
    {
        Direction = direction;
        Codes = codes;
        StationType = stationType;
        Title = title;
        Longitude = longitude;
        TransportType = transportType;
        Latitude = latitude;
    }
    
    public string? Direction { get; }
    
    public CodesDto? Codes { get; }
    
    [JsonPropertyName("station_type")]
    public string? StationType { get; }
    
    public string? Title { get; }
    
    [JsonConverter(typeof(NullableDoubleConverter))]
    public double? Longitude { get; }
    
    [JsonPropertyName("transport_type")]
    public string? TransportType { get; }
    
    [JsonConverter(typeof(NullableDoubleConverter))]
    public double? Latitude { get; }
}