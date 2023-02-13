using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

namespace suburban.console.DataTypes;

public record SettlementTransitType : ITransitType
{
    public required string Title { get; init; }
    public required Codes Codes { get; init; }
    public required IEnumerable<StationsTransitType> Stations { get; init; }
}