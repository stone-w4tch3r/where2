using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;

namespace suburban.console.YandexDataService.Filters;

public class StationsFilter : IDataFilter<Stations>
{
    public Stations Filter(Stations stations) =>
        stations with
        {
            Country = stations.Country with
            {
                Regions = stations.Country.Regions.Select(region => region with
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