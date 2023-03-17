using YandexService.API.DataTypes;
using YandexService.API.DataTypes.Enums;

namespace YandexService.Core.Mapping.Filters;

internal class StationsFilter
{
    public static Stations Filter(Stations stations) =>
        new (stations.Country with
        {
            Regions = stations.Country.Regions.Select(region => region with
            {
                Settlements = region.Settlements.Select(settlement => settlement with
                {
                    Stations = settlement.Stations
                        .Where(station => station.TransportType is TransportType.Suburban or TransportType.Train)
                }).Where(settlement => settlement.Stations.Any())
            }).Where(x => x.Settlements.Any())
        });
}