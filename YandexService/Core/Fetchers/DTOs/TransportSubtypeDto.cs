using System.Drawing;
using System.Text.Json.Serialization;
using suburban.essentials;

namespace YandexService.Core.Fetchers.DTOs;

internal record TransportSubtypeDto : IDto
{
    public required string? Title { get; init; }

    public required string? Code { get; init; }

    [JsonConverter(typeof(JsonHexadecimalColorConverter))]
    public required Color? Color { get; init; }
}