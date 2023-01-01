using System.Text.Json.Serialization;
using suburban.console.DataTypes.Enums;

namespace suburban.console.DataTypes;

public record Station(
    string Title,
    Codes Codes,
    string? Direction,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    StationType StationType,
    double? Longitude,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    TransportType TransportType,
    double? Latitude);