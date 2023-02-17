using YandexService.Fetchers.DTOs;

namespace YandexService.Fetchers.Endpoints;

public class StationsApiEndpoint : ApiEndpointBase<StationsDto>
{
    protected override string RootPath => "https://api.rasp.yandex.net/v3.0/stations_list";
    
    public override HttpMethod Method => HttpMethod.Get;
}