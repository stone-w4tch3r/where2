namespace suburban.console.Records;

public record Station(
    string Title,
    Codes Codes,
    string? Direction, //todo add enum
    string? StationType, //todo add enum
    double? Longitude,
    string? TransportType, //todo add enum
    double? Latitude);