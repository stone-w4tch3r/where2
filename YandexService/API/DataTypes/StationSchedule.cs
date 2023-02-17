using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record StationSchedule : SavableRecord, IDataType
{
    public required Station Station { get; init; }

    public required List<Schedule>? Schedules { get; init; }

    public required List<ScheduleDirection> Directions { get; init; }
}