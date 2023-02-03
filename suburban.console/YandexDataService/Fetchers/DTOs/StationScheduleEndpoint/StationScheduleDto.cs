using System.Text.Json.Serialization;

namespace suburban.console.YandexDataService.Fetchers.DTOs.StationScheduleEndpoint;

public partial record StationScheduleDto : IDto
{
    public DateTime? Date { get; init; }
    
    public StationDto? Station { get; init; }
    
    public Pagination? Pagination { get; init; }
    
    public IEnumerable<Schedule>? Schedule { get; init; }
    
    [JsonPropertyName("interval_schedule")]
    public IEnumerable<object>? IntervalSchedule { get; init; } //idk what is this, but it's not documented in the API
    
    public IEnumerable<Direction>? Directions { get; init; }
    
    [JsonPropertyName("schedule_direction")]
    public Direction? SelectedDirection { get; init; }
}