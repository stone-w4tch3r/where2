using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record Schedule : IModel
{
    public required IEnumerable<RouteThread> RouteThreads { get; init; }

    public required IEnumerable<ScheduleDirection> Directions { get; init; }
}