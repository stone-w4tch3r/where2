using System.Text.Json.Serialization;
using suburban.console.DataTypes.Abstractions;
using suburban.console.DataTypes.Enums;

namespace suburban.console.DataTypes;

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