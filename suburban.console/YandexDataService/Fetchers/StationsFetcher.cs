using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using suburban.console.DataTypes;
using suburban.console.Extensions;
using suburban.console.HelperServices;
using suburban.console.YandexDataService.DTOs;
using suburban.console.YandexDataService.Endpoints;
using suburban.essentials;
using suburban.shared;

namespace suburban.console.YandexDataService;

public class StationsFetcher : IStationsFetcher
{
    private readonly IHttpClientContext _context;
    private readonly IStationsDtoValidator _validator;
    private readonly IFileService _fileService;
    public StationsFetcher (IHttpClientContext context, IStationsDtoValidator validator, IFileService fileService)
    {
        _context = context;
        _validator = validator;
        _fileService = fileService;
    }
    
    public async Task<Result<Stations>> TryFetchAllStations() =>
        await FetchAllStations(_context).ConfigureAwait(false) is { } fetchedStationsDto
        && true.LogToFile(fetchedStationsDto, FileResources.Debug.FetchedStationsDto, _fileService)
            ? new (true, _validator.Validate(fetchedStationsDto))
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