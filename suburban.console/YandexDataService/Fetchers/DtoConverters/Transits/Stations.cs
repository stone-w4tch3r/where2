using suburban.console.DataTypes;
using suburban.console.DataTypes.Abstractions;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits;

public record Stations(Country Country) : SavableRecord, ITransitType;