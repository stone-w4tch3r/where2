using YandexService.DataTypes.Abstractions;

namespace YandexService.DataTypes;

public record Country(string Title, Codes Codes, IEnumerable<Region> Regions) : IDataType;