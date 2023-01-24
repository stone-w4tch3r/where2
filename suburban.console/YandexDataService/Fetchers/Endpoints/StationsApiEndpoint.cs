using suburban.console.YandexDataService.Fetchers.DTOs;

namespace suburban.console.YandexDataService.Fetchers.Endpoints;

public class StationsApiEndpoint : ApiEndpointBase<StationsDto>
{
    protected override string PathInternal => "https://api.rasp.yandex.net/v3.0/stations_list";
    
    public override HttpMethod Method => HttpMethod.Get;
}