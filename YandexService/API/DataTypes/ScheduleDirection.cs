using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record ScheduleDirection : IModel
{
    public required string CodeName { get; init; }

    public required string LocalizedTitle { get; init; }
}