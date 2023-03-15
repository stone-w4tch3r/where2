using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.Endpoints;

internal class StationsEndpoint : EndpointBase<StationsDto>
{
    protected override string RootPath => "https://api.rasp.yandex.net/v3.0/stations_list";

    public override HttpMethod Method => HttpMethod.Get;
}