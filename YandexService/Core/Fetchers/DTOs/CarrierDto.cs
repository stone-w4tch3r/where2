using System.Text.Json.Serialization;

namespace YandexService.Core.Fetchers.DTOs;

public record CarrierDto : IDto
{
    [JsonPropertyName("code")]
    public required int? YandexCode { get; init; }
    
    public required string? Title { get; init; }
}