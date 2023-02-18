using System.Text.Json.Serialization;
using YandexService.API.DataTypes;

namespace YandexService.Core.Fetchers.DTOs;

public record StationScheduleDto : IDto
{
    [JsonPropertyName("date")]
    public required DateOnly? RequestedDate { get; init; }

    public required StationDto? Station { get; init; }

    public required PaginationDto? Pagination { get; init; }

    [JsonPropertyName("schedule")]
    public required IEnumerable<ScheduleDto>? Schedules { get; init; }

    public required IEnumerable<ScheduleDirectionDto>? Directions { get; init; }

    [JsonPropertyName("schedule_direction")]
    public required ScheduleDirectionDto? RequestedDirection { get; init; }
}