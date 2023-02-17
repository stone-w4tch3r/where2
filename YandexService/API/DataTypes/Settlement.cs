using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record Settlement(string Title, Codes Codes, IEnumerable<Station> Stations) : IDataType;