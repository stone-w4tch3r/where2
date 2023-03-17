using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record StationSchedule : IModel
{
    public required Station Station { get; init; }

    public required IEnumerable<RouteThread> RouteThreads { get; init; }

    public required IEnumerable<ScheduleDirection> Directions { get; init; }
}