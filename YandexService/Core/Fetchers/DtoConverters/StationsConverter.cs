using suburban.essentials;
using suburban.essentials.Exceptions;
using YandexService.API.DataTypes;
using YandexService.Core.Fetchers.DtoConverters.Filters;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

internal class StationsConverter : IDtoConverter<StationsDto, Stations>
{
    private readonly IDtoConverter<CodesDto, Codes> _codesConverter;
    private readonly IDtoConverter<StationDto, Station> _stationConverter;
    private readonly IDataFilter<Stations> _stationsFilter;

    public StationsConverter(
        IDataFilter<Stations> stationsFilter,
        IDtoConverter<CodesDto, Codes> codesConverter,
        IDtoConverter<StationDto, Station> stationConverter)
    {
        _stationsFilter = stationsFilter;
        _codesConverter = codesConverter;
        _stationConverter = stationConverter;
    }

    public Stations ConvertToDataType(StationsDto dto) =>
        (dto.Countries ?? throw new NRE(nameof(dto.Countries)))
        .First(countryDto => countryDto.Title == "Россия")
        .Map(countryDto => new Stations(Convert(countryDto)))
        .Map(_stationsFilter.Filter);

    private Country Convert(CountryDto dto) =>
        new(
            dto.Title ?? throw new NRE(dto.Title),
            _codesConverter.ConvertToDataType(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Regions ?? throw new NRE(nameof(dto.Regions))).Select(Convert));

    private Region Convert(RegionDto dto) =>
        new(
            dto.Title ?? throw new NRE(nameof(dto.Title)),
            _codesConverter.ConvertToDataType(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Settlements ?? throw new NRE(nameof(dto.Settlements))).Select(Convert));

    private Settlement Convert(SettlementDto dto) =>
        new(
            dto.Title ?? throw new NRE(nameof(dto.Title)),
            _codesConverter.ConvertToDataType(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Stations ?? throw new NRE(nameof(dto.Stations))).Select(_stationConverter.ConvertToDataType));
}