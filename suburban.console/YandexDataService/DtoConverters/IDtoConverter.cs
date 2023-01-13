using suburban.console.DataTypes;
using suburban.console.YandexDataService.DTOs;

namespace suburban.console.YandexDataService.DtoConverters;

public interface IDtoConverter
{
    public Stations Convert(StationsDto dto);
}