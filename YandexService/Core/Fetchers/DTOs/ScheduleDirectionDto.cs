using System.Text.Json.Serialization;

namespace YandexService.Core.Fetchers.DTOs;

internal record ScheduleDirectionDto : IDto
{
    [JsonPropertyName("code")]
    public string? CodeName { get; init; }

    [JsonPropertyName("title")]
    public string? LocalizedTitle { get; init; }
}