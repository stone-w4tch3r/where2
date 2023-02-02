using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public partial record StationScheduleDto : IDto
{
    public object? Date { get; init; }
    public StationDto? Station { get; init; }
    public Pagination? Pagination { get; init; }
    public List<Schedule>? Schedule { get; init; }
    public List<object>? IntervalSchedule { get; init; }
    public List<Direction>? Directions { get; init; }
    public ScheduleDirection? ScheduleDirection { get; init; }
}