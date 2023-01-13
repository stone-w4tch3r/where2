using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using suburban.console.DataTypes;
using suburban.console.Extensions;
using suburban.console.HelperServices;
using suburban.console.YandexDataService.DtoConverters;
using suburban.console.YandexDataService.DTOs;
using suburban.console.YandexDataService.Endpoints;
using suburban.essentials;
using suburban.shared;

namespace suburban.console.YandexDataService.Fetchers;

public class StationsFetcher : IDataFetcher<Stations>
{
    private readonly IHttpClientContext _context;
    private readonly IDtoConverter<StationsDto, Stations> _converter;
    private readonly IFileService _fileService;
    
    public StationsFetcher (IHttpClientContext context, IDtoConverter<StationsDto, Stations> converter, IFileService fileService)
    {
        _context = context;
        _converter = converter;
        _fileService = fileService;
    }
    
    public async Task<Result<Stations>> TryFetchData() =>
        await FetchAllStations(_context).ConfigureAwait(false) is { } fetchedStationsDto
        && true.LogToFile(fetchedStationsDto, FileResources.Debug.FetchedStationsDto, _fileService)
            ? new (true, _converter.ConvertDtoToDataType(fetchedStationsDto))
            : new (false, default);

    private static async Task<StationsDto?> FetchAllStations(IHttpClientContext context)
    {
        try
        {
            return await context.RunEndpoint(new StationsApiEndpoint()).ConfigureAwait(false);
        }
        catch (NetworkException e)
        {
            Console.WriteLine($"{e.StatusCode}\n{e.Message}\n{e.StackTrace}");
            return null;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return null;
        }
    }
}