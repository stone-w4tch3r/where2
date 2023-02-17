using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record Country(string Title, Codes Codes, IEnumerable<Region> Regions) : IDataType;