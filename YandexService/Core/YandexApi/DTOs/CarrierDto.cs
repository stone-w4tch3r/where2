using System.Text.Json.Serialization;

namespace YandexService.Core.YandexApi.DTOs;

internal record CarrierDto : IDto
{
    [JsonPropertyName("code")]
    public int? YandexCode { get; init; }

    public string? Title { get; init; }
}