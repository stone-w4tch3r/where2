using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record Stations(IEnumerable<Region> Regions) : IModel;