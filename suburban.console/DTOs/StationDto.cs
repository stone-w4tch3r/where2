namespace suburban.console.DTOs;

public record StationDto(
    string? Direction, 
    CodesDto? Codes, 
    string? StationType, 
    string? Title,
    double? Longitude,
    string? TransportType, 
    double? Latitude);