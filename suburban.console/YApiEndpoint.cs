using Arbus.Network.Abstractions;
using suburban.console.DTOs;

namespace suburban.console;

public class YApiEndpoint : ApiEndpoint<StationsListDto>
{
    public override string Path => "https://example.com/api/v1/orders";

    public override HttpMethod Method => HttpMethod.Get;
}