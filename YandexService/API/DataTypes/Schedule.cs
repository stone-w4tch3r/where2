using YandexService.API.DataTypes.Abstractions;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.API.DataTypes;

public record Schedule : IDataType
{
    public required string? Arrival { get; init; }

    public required string? Departure { get; init; }

    public required string? Days { get; init; }

    public required string? Direction { get; init; }

    public required string? ExceptDays { get; init; }

    public required string? Platform { get; init; }

    public required string? Stops { get; init; }

    public required RouteThreadDto? RouteThread { get; init; }

    public required bool? IsFuzzy { get; init; }

    public required string? AirportTerminal { get; init; }
}