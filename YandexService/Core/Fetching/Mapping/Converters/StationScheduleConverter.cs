using suburban.essentials.Exceptions;
using YandexService.API.DataTypes;
using YandexService.API.DataTypes.Enums;
using YandexService.Core.Fetching.DTOs;

namespace YandexService.Core.Fetching.Mapping.Converters;

internal class StationScheduleConverter
{
    private readonly Func<string?, TransportType> _transportTypeConverter;

    public StationScheduleConverter(
        Func<string?, TransportType> transportTypeConverter)
    {
        _transportTypeConverter = transportTypeConverter;
    }

    public Schedule Convert(ScheduleDto dto) =>
        new()
        {
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
            TransportType = _transportTypeConverter(dto.TransportType),
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
            "rex" => TransportSubtype.SubtypeCode.Rex,
            "sputnik" => TransportSubtype.SubtypeCode.Sputnik,
            "skiarrow" => TransportSubtype.SubtypeCode.Skiarrow,
            "shezh" => TransportSubtype.SubtypeCode.Shezh,
            "skirus" => TransportSubtype.SubtypeCode.Skirus,
            "city" => TransportSubtype.SubtypeCode.City,
            "kalina" => TransportSubtype.SubtypeCode.Kalina,
            "vostok" => TransportSubtype.SubtypeCode.Vostok,
            "prostoryaltaya" => TransportSubtype.SubtypeCode.Prostoryaltaya,
            "14vag" => TransportSubtype.SubtypeCode.Vag14,
            "last" or "lastdl" => TransportSubtype.SubtypeCode.Last,
            "exprdal" => TransportSubtype.SubtypeCode.Exprdal,
            "volzhex" => TransportSubtype.SubtypeCode.Volzhex,
            "stdplus" => TransportSubtype.SubtypeCode.Stdplus,
            "express" => TransportSubtype.SubtypeCode.Express,
            "skor" => TransportSubtype.SubtypeCode.Skor,
            "fiztekh" => TransportSubtype.SubtypeCode.Fiztekh,
            "vag6" => TransportSubtype.SubtypeCode.Vag6,
            "suburban" => TransportSubtype.SubtypeCode.Suburban,
            _ => throw new ArgumentOutOfRangeException($"{nameof(subtype)}: {subtype}")
        };
}