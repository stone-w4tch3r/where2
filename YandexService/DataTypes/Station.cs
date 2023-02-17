using System.Text.Json.Serialization;
using YandexService.DataTypes.Abstractions;
using YandexService.DataTypes.Enums;

namespace YandexService.DataTypes;

public record Station(
    string Title,
    string? ShortTitle,
    string? PopularTitle,
    Codes Codes,
    string? Direction,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    StationType StationType,
    double? Longitude,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    TransportType TransportType,
    double? Latitude) : IDataType;