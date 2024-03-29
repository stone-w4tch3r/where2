using System.Drawing;
using System.Text.Json.Serialization;
using YandexService.Infrastructure.JsonConverters;

namespace YandexService.Core.Fetching.DTOs;

internal record TransportSubtypeDto : IDto
{
    public string? Title { get; init; }

    public string? Code { get; init; }

    [JsonConverter(typeof(JsonHexadecimalColorConverter))]
    public Color? Color { get; init; }
}