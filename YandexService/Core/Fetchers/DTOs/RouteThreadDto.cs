using System.Text.Json.Serialization;

namespace YandexService.Core.Fetchers.DTOs;

internal record RouteThreadDto : IDto
{
    public string? Number { get; init; }

    [JsonPropertyName("uid")]
    public string? Id { get; init; }

    public string? Title { get; init; }

    [JsonPropertyName("short_title")]
    public string? ShortTitle { get; init; }

    [JsonPropertyName("express_type")]
    public string? ExpressType { get; init; }

    [JsonPropertyName("transport_type")]
    public string? TransportType { get; init; }

    public TransportSubtypeDto? TransportSubtype { get; init; }

    public string? Vehicle { get; init; }

    public CarrierDto? Carrier { get; init; }
}