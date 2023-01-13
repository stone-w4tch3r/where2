using suburban.console.DataTypes;
using suburban.console.YandexDataService.DTOs;

namespace suburban.console.YandexDataService;

public interface IStationsDtoValidator
{
    public Stations Validate(StationsDto dto);
}