using System.Text.Json.Serialization;

namespace YandexService.Core.Fetchers.DTOs;

public record RouteThreadDto : IDto
{
    public required string? Number { get; init; }
    
    [JsonPropertyName("uid")]
    public required string? Id { get; init; }
    
    public required string? Title { get; init; }
    
    [JsonPropertyName("short_title")]
    public required string? ShortTitle { get; init; }
    
    [JsonPropertyName("express_type")]
    public required string? ExpressType { get; init; }
    
    [JsonPropertyName("transport_type")]
    public required string? TransportType { get; init; }
    
    public required TransportSubtypeDto? TransportSubtype { get; init; }
    
    public required string? Vehicle { get; init; }
    
    public required CarrierDto? Carrier { get; init; }
}