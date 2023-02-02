using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Filters;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;
using suburban.console.YandexDataService.Fetchers.DTOs;
using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;
using suburban.essentials;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters;

public class StationsConverter : IDtoConverter<StationsDto, StationsTransitType>
{
    private readonly IDataFilter<StationsTransitType> _stationsFilter;
    
    public StationsConverter(IDataFilter<StationsTransitType> stationsFilter)
    {
        _stationsFilter = stationsFilter;
    }

    
}