using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using suburban.essentials.HelperServices;
using suburban.shared;
using YandexService.Core.Fetching.DTOs;
using YandexService.Infrastructure.Extensions;

namespace YandexService.Core.Fetching;

internal class Fetcher
{
    private readonly IHttpClientContext _context;
    private readonly IFileService _fileService;

    public Fetcher(IHttpClientContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    public async Task<TDto?> Fetch<TEndpoint, TDto>(TEndpoint endpoint)
        where TDto : class, IDto
        where TEndpoint : ApiEndpoint<TDto>
    {
        try
        {
            return await RunEndpoint<TEndpoint, TDto>(endpoint, _context, _fileService).ConfigureAwait(false);
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

    private static Task<TDto> RunEndpoint<TEndpoint, TDto>(
        TEndpoint endpoint,
        IHttpClientContext context,
        IFileService fileService)
        where TDto : class, IDto
        where TEndpoint : ApiEndpoint<TDto>
        =>
            context.RunEndpointWithLogging(
                endpoint,
                FileResources.Debug.GetFileInfoForFetchedType(typeof(TDto)),
                fileService);
}