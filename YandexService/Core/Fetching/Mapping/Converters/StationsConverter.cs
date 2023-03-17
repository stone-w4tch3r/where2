using suburban.essentials;
using suburban.essentials.Exceptions;
using YandexService.API.DataTypes;
using YandexService.Core.Fetching.DTOs;

namespace YandexService.Core.Fetching.Mapping.Converters;

internal class StationsConverter
{
    private readonly Func<CodesDto, Codes> _codesConverter;
    private readonly Func<StationDto, Station> _stationConverter;
    private readonly Func<Stations, Stations> _stationsFilter;

    public StationsConverter(
        Func<Stations, Stations> stationsFilter,
        Func<CodesDto, Codes> codesConverter,
        Func<StationDto, Station> stationConverter)
    {
        _stationsFilter = stationsFilter;
        _codesConverter = codesConverter;
        _stationConverter = stationConverter;
    }

    public Stations Convert(StationsDto dto) =>
        (dto.Countries ?? throw new NRE(nameof(dto.Countries)))
        .First(countryDto => countryDto.Title == "Россия")
        .Map(countryDto => new Stations(Convert(countryDto)))
        .Map(_stationsFilter);

    private Country Convert(CountryDto dto) =>
        new(
            dto.Title ?? throw new NRE(dto.Title),
            _codesConverter(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Regions ?? throw new NRE(nameof(dto.Regions))).Select(Convert));

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