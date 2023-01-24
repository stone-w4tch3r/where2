using Arbus.Network.Abstractions;
using suburban.console.YandexDataService.Fetchers.DTOs;

namespace suburban.console.YandexDataService.Fetchers.Endpoints;

public abstract class ApiEndpointBase<TDto> : ApiEndpoint<TDto>
    where TDto : IDto
{
    private const string ApiKeyPathPart = "/?apikey=741883ec-2d53-4830-aa83-fa17b38c1f66";

    public override string Path => PathInternal + ApiKeyPathPart;

    protected abstract string PathInternal { get; }
}