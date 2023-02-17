using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record ScheduleDirection : IDataType
{
    public required string CodeName { get; init; }

    public required string LocalizedTitle { get; init; }
}