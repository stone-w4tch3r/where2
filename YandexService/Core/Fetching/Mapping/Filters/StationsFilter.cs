using suburban.essentials;
using YandexService.API.DataTypes.Enums;
using YandexService.Core.Fetching.DTOs;

namespace YandexService.Core.Fetching.Mapping.Filters;

internal class StationsFilter
{
    private readonly Func<string?, TransportType> _transportTypeConverter;

    public StationsFilter(Func<string?, TransportType> transportTypeConverter)
    {
        _transportTypeConverter = transportTypeConverter;
    }

    public StationsDto Filter(StationsDto stations) =>
        GetRussia(stations)
            .MapOrNull(FilterRegionsInCountry)
            .Map<CountryDto?, StationsDto>(country =>
                country is not null
                    ? new(new[] { country })
                    : new(Enumerable.Empty<CountryDto>()));

    private static CountryDto? GetRussia(StationsDto stations) =>
        stations.Countries?.FirstOrDefault(country => country.Title == "Россия");

    private CountryDto FilterRegionsInCountry(CountryDto country) =>
        country with { Regions = GetFilteredRegions(country).Where(HasSettlements) };

    private IEnumerable<RegionDto> GetFilteredRegions(CountryDto country) =>
        country.Regions?.Select(FilterSettlementsInRegion) ?? Enumerable.Empty<RegionDto>();

    private static bool HasSettlements(RegionDto region) => region.Settlements?.Any() ?? false;

    private RegionDto FilterSettlementsInRegion(RegionDto region) =>
        region with { Settlements = GetFilteredSettlements(region)?.Where(HasStations) };

    private static bool HasStations(SettlementDto settlement) => settlement.Stations?.Any() ?? false;

    private IEnumerable<SettlementDto>? GetFilteredSettlements(RegionDto region) =>
        region.Settlements?.Select(FilterStationsInSettlement);

    private SettlementDto FilterStationsInSettlement(SettlementDto settlement) =>
        settlement with { Stations = FilterStations(settlement.Stations) };

    private IEnumerable<StationDto>? FilterStations(IEnumerable<StationDto>? stations) =>
        stations?.Where(IsTrainOrSuburban);

    private bool IsTrainOrSuburban(StationDto station) =>
        _transportTypeConverter(station.TransportType) is TransportType.Train or TransportType.Suburban;
}