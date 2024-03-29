using suburban.essentials;
using suburban.essentials.Exceptions;
using YandexService.API.DataTypes;
using YandexService.Core.Fetching.DTOs;

namespace YandexService.Core.Fetching.Mapping.Converters;

internal class StationsConverter
{
    private readonly Func<CodesDto, Codes> _codesConverter;
    private readonly Func<StationDto, Station> _stationConverter;
    private readonly Func<StationsDto, StationsDto> _stationsFilter;

    public StationsConverter(
        Func<CodesDto, Codes> codesConverter,
        Func<StationDto, Station> stationConverter,
        Func<StationsDto, StationsDto> stationsFilter)
    {
        _stationsFilter = stationsFilter;
        _codesConverter = codesConverter;
        _stationConverter = stationConverter;
    }

    public Stations Convert(StationsDto dto) =>
        dto
            .To(_stationsFilter)
            .To(stationsDto => stationsDto.Countries?.Single() ?? throw new NRE(nameof(stationsDto.Countries)))
            .To(CountryToStations);

    private Stations CountryToStations(CountryDto dto) =>
        new((dto.Regions ?? throw new NRE(nameof(dto.Regions))).Select(Convert));

    private Region Convert(RegionDto dto) =>
        new(
            dto.Title ?? throw new NRE(nameof(dto.Title)),
            _codesConverter(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Settlements ?? throw new NRE(nameof(dto.Settlements))).Select(Convert));

    private Settlement Convert(SettlementDto dto) =>
        new(
            dto.Title ?? throw new NRE(nameof(dto.Title)),
            _codesConverter(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Stations ?? throw new NRE(nameof(dto.Stations))).Select(_stationConverter));
}