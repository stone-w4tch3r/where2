using System.Text.Json.Serialization;

namespace YandexService.Core.Fetchers.DTOs;

public record ScheduleDto : IDto
{
    [JsonPropertyName("Thread")]
    public required RouteThreadDto? RouteThread { get; init; }

    [JsonPropertyName("is_fuzzy")]
    public required bool? IsFuzzy { get; init; }

    public required string? Platform { get; init; }

    [JsonPropertyName("terminal")]
    public required string? AirportTerminal { get; init; }

    public required string? Days { get; init; }

    [JsonPropertyName("except_days")]
    public required string? ExceptDays { get; init; }

    public required string? Stops { get; init; }

    public required string? Direction { get; init; }

    public required string? Arrival { get; init; }

    public required string? Departure { get; init; }
}