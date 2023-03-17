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

    public async Task<TModel?> Fetch<TDto, TModel>(
        ApiEndpoint<TDto> endpoint,
        Func<TDto, TModel> map)
        where TDto : IDto
        =>
            await Fetch(endpoint, _context, _fileService).ConfigureAwait(false)
            is { } dto
                ? map(dto)
                : default;

    private static async Task<TDto?> Fetch<TDto>(
        ApiEndpoint<TDto> endpoint, 
        IHttpClientContext context,
        IFileService fileService) 
        where TDto : IDto
    {
        try
        {
            return await RunEndpoint(endpoint, context, fileService).ConfigureAwait(false);
        }
        catch (NetworkException e)
        {
            Console.WriteLine($"{e.StatusCode}\n{e.Message}\n{e.StackTrace}");
            return default;
        }
        catch (Exception e)
        {
            Console.WriteLine($"{e.Message}\n{e.StackTrace}");
            return default;
        }
    }

    private static Task<TDto> RunEndpoint<TDto>(
        ApiEndpoint<TDto> endpoint,
        IHttpClientContext context,
        IFileService fileService)
        where TDto : IDto
        =>
            context.RunEndpointWithLogging(
                endpoint,
                FileResources.Debug.GetFileInfo(typeof(TDto)),
                fileService);
}