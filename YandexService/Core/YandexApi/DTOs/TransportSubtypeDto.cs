using System.Drawing;
using System.Text.Json.Serialization;
using suburban.essentials;

namespace YandexService.Core.YandexApi.DTOs;

internal record TransportSubtypeDto : IDto
{
    public string? Title { get; init; }

    public string? Code { get; init; }

    [JsonConverter(typeof(JsonHexadecimalColorConverter))]
    public Color? Color { get; init; }
}