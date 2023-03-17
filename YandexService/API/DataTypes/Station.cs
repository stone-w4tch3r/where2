using System.Text.Json.Serialization;
using YandexService.API.DataTypes.Abstractions;
using YandexService.API.DataTypes.Enums;

namespace YandexService.API.DataTypes;

public record Station : IModel
{
    public required string Title { get; init; }

    public required string? ShortTitle { get; init; }

    public required string? PopularTitle { get; init; }

    public required Codes Codes { get; init; }

    public required string? Direction { get; init; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public required StationType StationType { get; init; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public required TransportType TransportType { get; init; }

    public required double? Longitude { get; init; }

    public required double? Latitude { get; init; }
}