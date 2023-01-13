using suburban.console.DataTypes;
using suburban.console.YandexDataService.DTOs;

namespace suburban.console.YandexDataService;

public interface IDtoValidator
{
    public StationsRoot Validate(StationsRootDto dto);
}