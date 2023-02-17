using System.Text.Json.Serialization;

namespace YandexService.Core.Fetchers.DTOs;

public record ScheduleDirectionDto : IDto
{
    [JsonPropertyName("code")]
    public required string? CodeName { get; init; }

    [JsonPropertyName("title")]
    public required string? LocalizedTitle { get; init; }
}