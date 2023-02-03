using System.Text.Json.Serialization;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

// ReSharper disable UnusedAutoPropertyAccessor.Global - json deserialization
public record CodesDto : IDto
{
    [JsonPropertyName("yandex_code")]
    public string? YandexCode { get; init; }

    [JsonPropertyName("esr_code")]
    public string? EsrCode { get; init; }
}