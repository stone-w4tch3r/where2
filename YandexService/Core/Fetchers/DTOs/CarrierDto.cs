using System.Text.Json.Serialization;

namespace YandexService.Core.Fetchers.DTOs;

internal record CarrierDto : IDto
{
    [JsonPropertyName("code")]
    public int? YandexCode { get; init; }

    public string? Title { get; init; }
}