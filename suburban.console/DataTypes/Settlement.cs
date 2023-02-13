using suburban.console.DataTypes.Abstractions;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

namespace suburban.console.DataTypes;

public record Settlement(string Title, Codes Codes, IEnumerable<Station> Stations) : IDataType;