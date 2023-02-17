using YandexService.DataTypes.Abstractions;

namespace YandexService.DataTypes;

public record Stations(Country Country) : SavableRecord, IDataType;