using suburban.console.YandexDataService.Fetchers.DTOs;

namespace suburban.console.YandexDataService.Fetchers.Endpoints;

public class StationScheduleApiEndpoint : ApiEndpointBase<StationScheduleDto>
{
    protected override string RootPath => "https://api.rasp.yandex.net/v3.0/schedule";
    
    public override HttpMethod Method => HttpMethod.Get;
}