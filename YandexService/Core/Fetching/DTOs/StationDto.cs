using System.Text.Json.Serialization;
using YandexService.Infrastructure.JsonConverters;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace YandexService.Core.Fetching.DTOs;

internal record StationDto : IDto
{
    public string? Direction { get; init; }

    public CodesDto? Codes { get; init; }
    
    public string? Code { get; init; }

    [JsonPropertyName("station_type")]
    public string? StationType { get; init; }

    public string? Title { get; init; }

    [JsonPropertyName("short_title")]
    public string? ShortTitle { get; init; }

    [JsonPropertyName("popular_title")]
    public string? PopularTitle { get; init; }

    [JsonConverter(typeof(NullableDoubleConverter))]
    public double? Longitude { get; init; }

    [JsonPropertyName("transport_type")]
    public string? TransportType { get; init; }

    [JsonConverter(typeof(NullableDoubleConverter))]
    public double? Latitude { get; init; }
}