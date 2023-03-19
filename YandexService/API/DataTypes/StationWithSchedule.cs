using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record StationWithSchedule(Station Station, Schedule Schedule) : IModel;