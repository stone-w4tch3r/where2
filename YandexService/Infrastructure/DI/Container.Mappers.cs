using System.Diagnostics.CodeAnalysis;
using YandexService.API.DataTypes;
using YandexService.Core.Fetching.DTOs;
using YandexService.Core.Fetching.Mapping;
using YandexService.Core.Fetching.Mapping.Converters;
using YandexService.Core.Fetching.Mapping.Filters;

namespace YandexService.Infrastructure.DI;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Local")]
[SuppressMessage("ReSharper", "MemberCanBePrivate.Local")]
internal partial class Container
{
    private class Mappers
    {
        public Func<StationsDto, Stations> StationsMapper { get; }

        public Func<StationScheduleDto, StationSchedule> ScheduleMapper { get; }

        [SuppressMessage("ReSharper", "ConvertToLocalFunction")]
        public Mappers()
        {
            var transportTypeConverter = TransportTypeConverter.Convert;
            var stationsFilterObject = new StationsFilter(transportTypeConverter);
            var stationScheduleFilter = StationScheduleFilter.Filter;
            var codesConverter = CodesConverter.Convert;
            Func<StationsDto, StationsDto> stationsFilter = dto => stationsFilterObject.Filter(dto);
            Func<StationDto, Station> stationConverter =
                dto => new StationConverter(codesConverter, transportTypeConverter).Convert(dto);
            Func<StationsDto, Stations> stationsConverter = dto =>
                new StationsConverter(codesConverter, stationConverter, stationsFilter).Convert(dto);
            Func<StationScheduleDto, StationSchedule> scheduleConverter = dto =>
                new StationScheduleConverter(transportTypeConverter, stationConverter).Convert(dto);
            // StationsMapper = dto => Mapper.Map(dto, stationsConverter, stationsFilter);
            ScheduleMapper = dto => Mapper.Map(dto, scheduleConverter, stationScheduleFilter);
        }
    }
}