using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record StationSchedule : IModel
{
    public required Codes StationCodes { get; init; }

    public required IEnumerable<RouteThread> RouteThreads { get; init; }

    public required IEnumerable<ScheduleDirection> Directions { get; init; }
}