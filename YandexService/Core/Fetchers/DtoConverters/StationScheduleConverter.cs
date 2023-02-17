using YandexService.API.DataTypes;
using YandexService.API.DataTypes.Enums;
using YandexService.Core.Fetchers.DtoConverters.Filters;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

public class StationScheduleConverter : IDtoConverter<StationScheduleDto, StationSchedule>
{
    private readonly IDataFilter<StationSchedule> _scheduleFilter;
    private readonly IStringToEnumConverter<TransportType> _transportTypeConverter;

    public StationScheduleConverter(
        IDataFilter<StationSchedule> scheduleFilter, 
        IStringToEnumConverter<TransportType> transportTypeConverter)
    {
        _scheduleFilter = scheduleFilter;
        _transportTypeConverter = transportTypeConverter;
    }

    public StationSchedule ConvertToDataType(StationScheduleDto dto) =>
        null!;
    
    public RouteThread Convert(RouteThreadDto dto) =>
        new()
        {
            Id = new(dto.Id ?? throw new NullReferenceException(nameof(dto.Id))),
            Title = dto.Title ?? throw new NullReferenceException(nameof(dto.Title)),
            Number = dto.Number ?? throw new NullReferenceException(nameof(dto.Number)),
            IsExpress = dto.ExpressType is not null,
            TransportType = _transportTypeConverter.ConvertToEnum(dto.TransportType),
            TransportSubtype = Convert(dto.TransportSubtype)
        };

    public TransportSubtype Convert(TransportSubtypeDto dto) =>
        new()
        {
            Code = Convert(dto.Code),
            Color = dto.Color.Value,
            Title = dto.Title
        };

    public static TransportSubtype.SubtypeCode Convert(string? subtype) =>
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