using System.Text.Json.Serialization;

namespace YandexService.Fetchers.DTOs;

public record CodesDto(
    [property: JsonPropertyName("yandex_code")] 
    string? YandexCode, 
    [property: JsonPropertyName("esr_code")] 
    string? EsrCode) : IDto;