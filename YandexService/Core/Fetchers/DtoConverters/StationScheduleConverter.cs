using YandexService.API.DataTypes;
using YandexService.Core.Fetchers.DtoConverters.Filters;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

public class StationScheduleConverter : IDtoConverter<StationScheduleDto, StationSchedule>
{
    private readonly IDataFilter<StationSchedule> _scheduleFilter;

    public StationScheduleConverter(IDataFilter<StationSchedule> scheduleFilter)
    {
        _scheduleFilter = scheduleFilter;
    }

    public StationSchedule ConvertDtoToDataType(StationScheduleDto dto) =>
        null!;
}