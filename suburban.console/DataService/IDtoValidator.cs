using suburban.console.DataService.DTOs;
using suburban.console.Records;

namespace suburban.console.DataService;

public interface IDtoValidator
{
    public StationsRoot Validate(StationsRootDto dto);
}