using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using suburban.essentials.HelperServices;
using suburban.shared;
using YandexService.Core.Fetching.DTOs;
using YandexService.Core.Fetching.Endpoints;
using YandexService.Infrastructure.Extensions;

namespace YandexService.Core.Fetching;

internal class Fetcher<TEndpoint, TDto>
    where TDto : class, IDto
    where TEndpoint : EndpointBase<TDto>
{
    private readonly IHttpClientContext _context;
    private readonly IFileService _fileService;

    public Fetcher(IHttpClientContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    public async Task<TDto?> Fetch(Func<TEndpoint> createEndpoint)
    {
        try
        {
            return await RunEndpoint(createEndpoint, _context, _fileService).ConfigureAwait(false);
        }
        catch (NetworkException e)
        {
            Console.WriteLine($"{e.StatusCode}\n{e.Message}\n{e.StackTrace}");
            return null;
        }
        catch (Exception e)
        {
            Console.WriteLine($"{e.Message}\n{e.StackTrace}");
            return null;
        }
    }

    private static Task<TDto> RunEndpoint(
        Func<TEndpoint> getEndpoint,
        IHttpClientContext context,
        IFileService fileService)
        =>
            context.RunEndpointWithLogging(
                getEndpoint(),
                FileResources.Debug.GetFileInfoForFetchedType(typeof(TDto)),
                fileService);
}