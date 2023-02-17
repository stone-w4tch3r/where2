using suburban.essentials;
using suburban.essentials.Exceptions;
using YandexService.API.DataTypes;
using YandexService.API.DataTypes.Enums;
using YandexService.Core.Fetchers.DtoConverters.Filters;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

public class StationsConverter : IDtoConverter<StationsDto, Stations>
{
    private readonly IDataFilter<Stations> _stationsFilter;
    private readonly IStringToEnumConverter<TransportType> _transportTypeConverter;

    public StationsConverter(
        IDataFilter<Stations> stationsFilter, 
        IStringToEnumConverter<TransportType> transportTypeConverter)
    {
        _stationsFilter = stationsFilter;
        _transportTypeConverter = transportTypeConverter;
    }

    public Stations ConvertToDataType(StationsDto dto) =>
        (dto.Countries ?? throw new NRE(nameof(dto.Countries)))
        .First(countryDto => countryDto.Title == "Россия")
        .Map(countryDto => new Stations(Convert(countryDto)))
        .Map(_stationsFilter.Filter);

    private Country Convert(CountryDto dto) =>
        new(
            dto.Title ?? throw new NRE(dto.Title),
            Convert(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Regions ?? throw new NRE(nameof(dto.Regions))).Select(Convert));

    private Region Convert(RegionDto dto) =>
        new(
            dto.Title ?? throw new NRE(nameof(dto.Title)),
            Convert(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Settlements ?? throw new NRE(nameof(dto.Settlements))).Select(Convert));

    private Settlement Convert(SettlementDto dto) =>
        new(
            dto.Title ?? throw new NRE(nameof(dto.Title)),
            Convert(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            (dto.Stations ?? throw new NRE(nameof(dto.Stations))).Select(Convert));

    private Station Convert(StationDto dto) =>
        new()
        {
            Title = dto.Title ?? throw new NRE(nameof(dto.Title)),
            ShortTitle = dto.ShortTitle,
            PopularTitle = dto.PopularTitle,
            Codes = Convert(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            Direction = dto.Direction,
            StationType = ConvertStationType(dto.StationType),
            TransportType = _transportTypeConverter.ConvertToEnum(dto.TransportType),
            Longitude = dto.Longitude,
            Latitude = dto.Latitude
        };

    private static Codes Convert(CodesDto dto) =>
        new(
            dto.YandexCode,
            dto.EsrCode);

    private static StationType ConvertStationType(string? stationType) =>
        stationType switch
        {
            "station" => StationType.Station,
            "platform" => StationType.Platform,
            "stop" => StationType.Stop,
            "checkpoint" => StationType.Checkpoint,
            "post" => StationType.Post,
            "crossing" => StationType.Crossing,
            "overtaking_point" => StationType.OvertakingPoint,
            "train_station" => StationType.TrainStation,
            "airport" => StationType.Airport,
            "bus_station" => StationType.BusStation,
            "bus_stop" => StationType.BusStop,
            "unknown" => StationType.Unknown,
            "port" => StationType.Port,
            "port_point" => StationType.PortPoint,
            "wharf" => StationType.Wharf,
            "river_port" => StationType.RiverPort,
            "marine_station" => StationType.MarineStation,
            "" => StationType.NullOrEmpty,
            null => StationType.NullOrEmpty,
            _ => throw new ArgumentOutOfRangeException($"<{stationType}>")
        };
}