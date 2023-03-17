using System.Text.Json.Serialization;

namespace YandexService.Core.Fetching.DTOs;

internal record ScheduleDto : IDto
{
    [JsonPropertyName("Thread")]
    public RouteThreadDto? RouteThread { get; init; }

    [JsonPropertyName("is_fuzzy")]
    public bool? IsFuzzy { get; init; }

    public string? Platform { get; init; }

    [JsonPropertyName("terminal")]
    public string? AirportTerminal { get; init; }

    public string? Days { get; init; }

    [JsonPropertyName("except_days")]
    public string? ExceptDays { get; init; }

    public string? Stops { get; init; }

    public string? Direction { get; init; }

    public string? Arrival { get; init; } //to timeOnly

    public string? Departure { get; init; } //to timeOnly
}