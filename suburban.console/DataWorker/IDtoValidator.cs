using suburban.console.DataWorker.DTOs;
using suburban.console.Records;

namespace suburban.console.DataWorker;

public interface IDtoValidator
{
    public StationsRoot Validate(StationsRootDto dto);
}