using YandexService.API.DataTypes;

namespace YandexService.Core.Fetching.Mapping.Filters;

internal class ModelConstructor
{
    public void Construct(Stations stations)
    {
        foreach (var region in stations.Country.Regions)
            foreach (var settlement in region.Settlements)
                foreach (var _ in settlement.Stations)
                {
                }
    }
}

internal class SuperClass
{
    
}