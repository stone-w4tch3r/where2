using YandexService.DataTypes.Abstractions;

namespace YandexService.DataTypes;

public record Settlement(string Title, Codes Codes, IEnumerable<Station> Stations) : IDataType;