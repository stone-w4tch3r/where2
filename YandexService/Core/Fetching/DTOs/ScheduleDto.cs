using System.Text.Json.Serialization;

namespace YandexService.Core.Fetching.DTOs;

internal record ScheduleDto : IDto
{
    [JsonPropertyName("date")]
    public DateOnly? RequestedDate { get; init; }

    public StationDto? Station { get; init; }

    public PaginationDto? Pagination { get; init; }

    [JsonPropertyName("schedule")]
    public IEnumerable<ScheduleEntryDto>? Schedules { get; init; }

    public IEnumerable<ScheduleDirectionDto>? Directions { get; init; }

    [JsonPropertyName("schedule_direction")]
    public ScheduleDirectionDto? RequestedDirection { get; init; }
}