using suburban.console.DataTypes;
using suburban.console.YandexDataService.DTOs;

namespace suburban.console.YandexDataService;

public interface IDtoConverter
{
    public Stations Convert(StationsDto dto);
}