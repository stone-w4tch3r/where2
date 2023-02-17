using System.Text.Json.Serialization;
using YandexService.API.DataTypes.Abstractions;
using YandexService.API.DataTypes.Enums;

namespace YandexService.API.DataTypes;

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