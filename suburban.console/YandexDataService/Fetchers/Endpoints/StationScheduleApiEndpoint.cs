using suburban.console.DataTypes;
using suburban.console.YandexDataService.Fetchers.DTOs;

namespace suburban.console.YandexDataService.Fetchers.Endpoints;

public class StationScheduleApiEndpoint : ApiEndpointBase<StationScheduleDto>
{
    private const string TimeZone = "Europe/Moscow";
    private const string TransportTypes = "suburban";
    private const int Limit = 999;

    private readonly Codes _stationCode;

    protected override string RootPath => "https://api.rasp.yandex.net/v3.0/schedule";
    
    public override HttpMethod Method => HttpMethod.Get;

    protected override IEnumerable<string> PathParts => new[]
    {
        $"station={_stationCode.YandexCode}",
        $"transport_types={TransportTypes}",
        $"result_timezone={TimeZone}",
        $"limit={Limit}"
    };
    
    public StationScheduleApiEndpoint(Codes stationCode)
    {
        _stationCode = stationCode;
    }
}