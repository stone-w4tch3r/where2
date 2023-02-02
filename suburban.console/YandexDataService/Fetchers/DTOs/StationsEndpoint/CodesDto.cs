using System.Text.Json.Serialization;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public record CodesDto(
    [property: JsonPropertyName("yandex_code")] 
    string? YandexCode, 
    [property: JsonPropertyName("esr_code")] 
    string? EsrCode) : IDto;