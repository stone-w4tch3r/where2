using suburban.essentials.Exceptions;
using YandexService.API.DataTypes;
using YandexService.API.DataTypes.Enums;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

internal class StationConverter
{
    private readonly Func<CodesDto, Codes> _codesConverter;
    private readonly Func<string?, TransportType> _transportTypeConverter;

    public StationConverter(
        Func<CodesDto, Codes> codesConverter,
        Func<string?, TransportType> transportTypeConverter)
    {
        _codesConverter = codesConverter;
        _transportTypeConverter = transportTypeConverter;
    }

    public Station ConvertToDataType(StationDto dto) =>
        new()
        {
            Title = dto.Title ?? throw new NRE(nameof(dto.Title)),
            ShortTitle = dto.ShortTitle,
            PopularTitle = dto.PopularTitle,
            Codes = _codesConverter(dto.Codes ?? throw new NRE(nameof(dto.Codes))),
            Direction = dto.Direction,
            StationType = ConvertStationType(dto.StationType),
            TransportType = _transportTypeConverter(dto.TransportType),
            Longitude = dto.Longitude,
            Latitude = dto.Latitude
        };

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