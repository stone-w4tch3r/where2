using System.Text.Json.Serialization;
using suburban.essentials;

namespace suburban.console.YandexDataService.Fetchers.DTOs;

public record StationDto(
    string? Direction,
    CodesDto? Codes,
    [property: JsonPropertyName("station_type")]
    string? StationType,
    string? Title,
    [property: JsonConverter(typeof(NullableDoubleConverter))]
    double? Longitude,
    [property: JsonPropertyName("transport_type")]
    string? TransportType,
    [property: JsonConverter(typeof(NullableDoubleConverter))]
    double? Latitude) : IDto;