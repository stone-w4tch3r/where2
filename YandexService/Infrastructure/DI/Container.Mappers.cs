using System.Diagnostics.CodeAnalysis;
using YandexService.API.DataTypes;
using YandexService.Core.Fetching;
using YandexService.Core.Fetching.DTOs;
using YandexService.Core.Mapping;
using YandexService.Core.Mapping.Converters;
using YandexService.Core.Mapping.Filters;

namespace YandexService.Infrastructure.DI;

internal partial class Container
{
    private class Mappers
    {
        public Func<StationsDto, Stations> StationsMapper { get; }

        public Func<StationScheduleDto, StationSchedule> ScheduleMapper { get; }

        [SuppressMessage("ReSharper", "ConvertToLocalFunction")]
        public Mappers(Services services)
        {
            var stationsFilter = StationsFilter.Filter;
            var stationScheduleFilter = StationScheduleFilter.Filter;
            var transportTypeConverter = TransportTypeConverter.Convert;
            var codesConverter = CodesConverter.Convert;
            Func<StationDto, Station> stationConverter =
                dto => new StationConverter(codesConverter, transportTypeConverter).Convert(dto);
            Func<StationsDto, Stations> stationsConverter = dto =>
                new StationsConverter(stationsFilter, codesConverter, stationConverter).Convert(dto);
            Func<StationScheduleDto, StationSchedule> scheduleConverter = dto =>
                new StationScheduleConverter(transportTypeConverter, stationConverter).Convert(dto);
            StationsMapper = dto => Mapper.Map(dto, stationsConverter, stationsFilter);
            ScheduleMapper = dto => Mapper.Map(dto, scheduleConverter, stationScheduleFilter);
        }
    }
}