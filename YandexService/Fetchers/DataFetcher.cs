using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using suburban.essentials;
using suburban.essentials.HelperServices;
using suburban.shared;
using YandexService.Extensions;
using YandexService.Fetchers.DTOs;
using YandexService.Fetchers.Endpoints;

namespace YandexService.Fetchers;

public class DataFetcher<TDto, TEndpoint> : IDataFetcher<TDto>
    where TDto : class, IDto
    where TEndpoint : ApiEndpointBase<TDto>, new()
{
    private readonly IHttpClientContext _context;
    private readonly IFileService _fileService;
    
    public DataFetcher (IHttpClientContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }
    
    public async Task<Result<TDto>> TryFetchData() =>
        await FetchAllStations(_context).ConfigureAwait(false) is { } fetchedStationsDto
            ? new (true, fetchedStationsDto)
            : new (false, default);

    private async Task<TDto?> FetchAllStations(IHttpClientContext context)
    {
        try
        {
            return await context.RunEndpointWithLogging(
                    new TEndpoint(),
                    FileResources.Debug.GetFileInfoForFetchedType(typeof(TDto)),
                    _fileService)
                .ConfigureAwait(false);
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
}