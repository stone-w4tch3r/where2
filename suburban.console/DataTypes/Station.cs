using suburban.console.DataTypes.Enums;

namespace suburban.console.DataTypes;

public record Station(
    string Title,
    Codes Codes,
    string? Direction,
    StationType StationType,
    double? Longitude,
    TransportType TransportType,
    double? Latitude);