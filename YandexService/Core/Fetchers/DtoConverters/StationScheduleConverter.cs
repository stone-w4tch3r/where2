using suburban.essentials.Exceptions;
using YandexService.API.DataTypes;
using YandexService.API.DataTypes.Enums;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

public class StationScheduleConverter : IDtoConverter<StationScheduleDto, StationSchedule>
{
    private readonly IDtoConverter<StationDto, Station> _stationConverter;
    private readonly IStringToEnumConverter<TransportType> _transportTypeConverter;

    public StationScheduleConverter(
        IStringToEnumConverter<TransportType> transportTypeConverter,
        IDtoConverter<StationDto, Station> stationConverter)
    {
        _transportTypeConverter = transportTypeConverter;
        _stationConverter = stationConverter;
    }

    public StationSchedule ConvertToDataType(StationScheduleDto dto) =>
        new()
        {
            Station = _stationConverter.ConvertToDataType(dto.Station ?? throw new NRE(nameof(dto.Station))),
            Directions = dto.Directions?.Select(Convert) ?? throw new NRE(nameof(dto.Directions)),
            RouteThreads = dto.Schedules?
                               .Select(x => Convert(x.RouteThread ?? throw new NRE(nameof(x.RouteThread))))
                           ?? Enumerable.Empty<RouteThread>()
        };

    private static ScheduleDirection Convert(ScheduleDirectionDto dto) =>
        new()
        {
            CodeName = dto.CodeName ?? throw new NRE(nameof(dto.CodeName)),
            LocalizedTitle = dto.LocalizedTitle ?? throw new NRE(nameof(dto.LocalizedTitle))
        };

    private RouteThread Convert(RouteThreadDto dto) =>
        new()
        {
            Id = new(dto.Id ?? throw new NRE(nameof(dto.Id))),
            Title = dto.Title ?? throw new NRE(nameof(dto.Title)),
            Number = dto.Number ?? throw new NRE(nameof(dto.Number)),
            IsExpress = dto.ExpressType is not null,
            TransportType = _transportTypeConverter.ConvertToEnum(dto.TransportType),
            TransportSubtype = Convert(dto.TransportSubtype ?? throw new NRE(nameof(dto.TransportSubtype)))
        };

    private static TransportSubtype Convert(TransportSubtypeDto dto) =>
        new()
        {
            Code = Convert(dto.Code),
            Color = dto.Color ?? throw new NRE(nameof(dto.Color)),
            Title = dto.Title ?? throw new NRE(nameof(dto.Title))
        };

    private static TransportSubtype.SubtypeCode Convert(string? subtype) =>
        subtype switch
        {
            "Rex" => TransportSubtype.SubtypeCode.Rex,
            "Sputnik" => TransportSubtype.SubtypeCode.Sputnik,
            "Skiarrow" => TransportSubtype.SubtypeCode.Skiarrow,
            "Shezh" => TransportSubtype.SubtypeCode.Shezh,
            "Skirus" => TransportSubtype.SubtypeCode.Skirus,
            "City" => TransportSubtype.SubtypeCode.City,
            "Kalina" => TransportSubtype.SubtypeCode.Kalina,
            "Vostok" => TransportSubtype.SubtypeCode.Vostok,
            "Prostoryaltaya" => TransportSubtype.SubtypeCode.Prostoryaltaya,
            "14Vag" => TransportSubtype.SubtypeCode.Vag14,
            "Last" => TransportSubtype.SubtypeCode.Last,
            "Exprdal" => TransportSubtype.SubtypeCode.Exprdal,
            "Volzhex" => TransportSubtype.SubtypeCode.Volzhex,
            "Stdplus" => TransportSubtype.SubtypeCode.Stdplus,
            "Express" => TransportSubtype.SubtypeCode.Express,
            "Skor" => TransportSubtype.SubtypeCode.Skor,
            "Fiztekh" => TransportSubtype.SubtypeCode.Fiztekh,
            "Vag6" => TransportSubtype.SubtypeCode.Vag6,
            _ => throw new ArgumentOutOfRangeException(nameof(subtype))
        };
}