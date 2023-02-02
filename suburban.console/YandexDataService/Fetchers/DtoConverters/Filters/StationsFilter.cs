using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Filters;

public class StationsFilter : IDataFilter<StationsTransitType>
{
    public StationsTransitType Filter(StationsTransitType stationsTransitType) =>
        stationsTransitType with
        {
            Country = stationsTransitType.Country with
            {
                Regions = stationsTransitType.Country.Regions.Select(region => region with
                {
                    Settlements =
                    region.Settlements.Select(settlement => settlement with
                    {
                        Stations = settlement.Stations
                            .Where(station => station.TransportType is TransportType.Suburban or TransportType.Train)
                    }).Where(settlement => settlement.Stations.Any())
                }).Where(x => x.Settlements.Any())
            }
        };
}