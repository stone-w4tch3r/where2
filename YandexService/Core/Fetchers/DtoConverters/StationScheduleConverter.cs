using YandexService.API.DataTypes;
using YandexService.Core.Fetchers.DtoConverters.Filters;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

public class StationScheduleConverter : IDtoConverter<StationScheduleDto, StationSchedule>
{
    private readonly IDataFilter<StationSchedule> _stationsFilter;
    
    public StationScheduleConverter(IDataFilter<StationSchedule> stationsFilter)
    {
        _stationsFilter = stationsFilter;
    }

    public StationSchedule ConvertDtoToDataType(StationScheduleDto dto) =>
        null!;
}