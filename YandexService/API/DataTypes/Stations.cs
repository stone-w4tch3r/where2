using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record Stations(Country Country) : SavableRecord, IDataType;