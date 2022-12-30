using Arbus.Network.Abstractions;
using suburban.console.DTOs;

namespace suburban.console;

public class YApiEndpoint : ApiEndpoint<StationsListDto>
{
    private const string ApiKeyPathPart = "/?apikey=741883ec-2d53-4830-aa83-fa17b38c1f66";
    public override string Path => "https://api.rasp.yandex.net/v3.0/stations_list" + ApiKeyPathPart;
    public override HttpMethod Method => HttpMethod.Get;
}