using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using suburban.essentials;
using suburban.essentials.HelperServices;
using suburban.shared;
using YandexService.Core.Fetchers.DTOs;
using YandexService.Core.Fetchers.Endpoints;
using YandexService.Infrastructure.Extensions;

namespace YandexService.Core.Fetchers;

internal class DataFetcher<TDto, TEndpoint> : IDataFetcher<TDto>
    where TDto : class, IDto
    where TEndpoint : EndpointBase<TDto>
{
    private readonly IHttpClientContext _context;
    private readonly IFileService _fileService;

    public DataFetcher(IHttpClientContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    public async Task<Result<TDto>> TryFetchData(Func<EndpointBase<TDto>> createEndpoint) =>
        await Fetch(createEndpoint, _context, _fileService).ConfigureAwait(false) is { } fetchedStationsDto
            ? new(true, fetchedStationsDto)
            : new(false, default);

    private static async Task<TDto?> Fetch(
        Func<EndpointBase<TDto>> createEndpoint, 
        IHttpClientContext context,
        IFileService fileService)
    {
        try
        {
            return await RunEndpoint(createEndpoint, context, fileService).ConfigureAwait(false);
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
        Func<EndpointBase<TDto>> createEndpoint, 
        IHttpClientContext context, 
        IFileService fileService) 
        =>
        context.RunEndpointWithLogging(
            createEndpoint(),
            FileResources.Debug.GetFileInfoForFetchedType(typeof(TDto)),
            fileService);
}