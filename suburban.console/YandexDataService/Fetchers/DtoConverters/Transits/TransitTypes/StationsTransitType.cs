using suburban.console.DataTypes;
using suburban.console.DataTypes.Abstractions;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

public partial record StationsTransitType : SavableRecord, ITransitType
{
    public required Country Country { get; init; }
}