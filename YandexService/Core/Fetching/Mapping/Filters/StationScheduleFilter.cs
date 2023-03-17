using YandexService.API.DataTypes;

namespace YandexService.Core.Fetching.Mapping.Filters;

public class StationScheduleFilter
{
    public static StationSchedule Filter(StationSchedule stationSchedule) =>
        stationSchedule with
        {
            //something
        };
}