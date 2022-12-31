namespace suburban.console.Records;

public record Station(
    string Title,
    Codes Codes,
    string Direction,
    string StationType,
    double? Longitude,
    string TransportType,
    double? Latitude);