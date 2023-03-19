using System.Diagnostics.CodeAnalysis;
using YandexService.API.DataTypes;
using YandexService.API.DataTypes.Enums;
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

        public Func<ScheduleDto, Schedule> ScheduleMapper { get; }

        [SuppressMessage("ReSharper", "ConvertToLocalFunction")]
        public Mappers()
        {
            var simpleMappers = GetSimpleMappers();

            var stationConverterObject = 
                new StationConverter(simpleMappers.codesDtoToModel, simpleMappers.stringToTransportType);
            Func<StationDto, Station> stationConverter = dto => stationConverterObject.Convert(dto);

            var stationsFilterObject = new StationsFilter(simpleMappers.stringToTransportType);
            Func<StationsDto, StationsDto> stationsFilter = dto => stationsFilterObject.Filter(dto);
            var stationsConverterObject = 
                new StationsConverter(simpleMappers.codesDtoToModel, stationConverter, stationsFilter);
            Func<StationsDto, Stations> stationsConverter = dto => stationsConverterObject.Convert(dto);
            Func<ScheduleDto, Schedule> scheduleConverter = dto =>
                new StationScheduleConverter(simpleMappers.stringToTransportType).Convert(dto);

            StationsMapper = dto => Mapper.Map(dto, stationsConverter, stationsFilter);
            ScheduleMapper = dto => Mapper.Map(dto, scheduleConverter, simpleMappers.scheduleFilter);
        }

        private static
            (Func<string?, TransportType> stringToTransportType,
            Func<CodesDto, Codes> codesDtoToModel,
            Func<ScheduleDto, ScheduleDto> scheduleFilter)
            GetSimpleMappers()
            =>
                (TransportTypeConverter.Convert, CodesConverter.Convert, s => s);
    }
}