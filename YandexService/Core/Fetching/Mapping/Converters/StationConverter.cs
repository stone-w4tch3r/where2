using suburban.essentials.Exceptions;
using YandexService.API.DataTypes;
using YandexService.API.DataTypes.Enums;
using YandexService.Core.Fetching.DTOs;

namespace YandexService.Core.Fetching.Mapping.Converters;

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

    public Station Convert(StationDto dto) =>
        new()
        {
            Title = dto.Title ?? throw new NRE(nameof(dto.Title)),
            Codes = GetCodes(dto),
            StationType = ConvertStationType(dto.StationType),
            TransportType = _transportTypeConverter(dto.TransportType),
            Longitude = dto.Longitude,
            Latitude = dto.Latitude
        };

    private Codes GetCodes(StationDto dto) =>
        _codesConverter(dto.Codes
                        ?? (dto.Code is not null
                            ? new(dto.Code, null)
                            : throw new NRE(nameof(dto.Codes))));

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