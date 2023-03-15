using System.Text.Json.Serialization;

namespace YandexService.Core.Fetchers.DTOs;

internal record ScheduleDirectionDto : IDto
{
    [JsonPropertyName("code")]
    public required string? CodeName { get; init; }

    [JsonPropertyName("title")]
    public required string? LocalizedTitle { get; init; }
}