using Arbus.Network.Abstractions;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.Endpoints;

internal abstract class EndpointBase<TDto> : ApiEndpoint<TDto>
    where TDto : IDto
{
    private const string ApiKeyPathPart = "/?apikey=741883ec-2d53-4830-aa83-fa17b38c1f66";

    public override string Path => RootPath + ApiKeyPathPart + "&" + string.Join("&", PathParts);

    protected abstract string RootPath { get; }

    protected virtual IEnumerable<string> PathParts { get; } = Enumerable.Empty<string>();
}

internal abstract class EndpointBase<TParameter, TDto> : EndpointBase<TDto>
    where TDto : IDto
{
    protected TParameter Parameter { get; }

    protected EndpointBase(TParameter parameter)
    {
        Parameter = parameter;
    }
}