using suburban.console.DataTypes;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

public record Settlement(string Title, Codes Codes, IEnumerable<StationsTransitType.Station> Stations) : ITransitType;