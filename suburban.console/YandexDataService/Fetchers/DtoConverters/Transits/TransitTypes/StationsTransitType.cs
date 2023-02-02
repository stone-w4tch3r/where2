using suburban.console.DataTypes;
using suburban.console.DataTypes.Abstractions;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

public record StationsTransitType(Country Country) : SavableRecord, ITransitType;