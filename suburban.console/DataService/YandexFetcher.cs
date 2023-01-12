using System.Diagnostics.CodeAnalysis;
using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using suburban.console.DataService.DTOs;
using suburban.console.DataTypes;
using suburban.console.Extensions;
using suburban.console.HelperServices;
using suburban.essentials;
using suburban.shared;

namespace suburban.console.DataService;

public class YandexFetcher : IYandexFetcher
{
    private readonly IHttpClientContext _context;
    private readonly IDtoValidator _validator;
    private readonly IFileService _fileService;
    public YandexFetcher (IHttpClientContext context, IDtoValidator validator, IFileService fileService)
    {
        _context = context;
        _validator = validator;
        _fileService = fileService;
    }
    
    public async Task<Result<StationsRoot>> TryFetchAllStations() =>
        await FetchAllStations(_context).ConfigureAwait(false) is { } fetchedStationsRootDto
        && true.LogToFile(fetchedStationsRootDto, FileResources.Debug.FetchedStationsRootDto, _fileService)
            ? new (true, _validator.Validate(fetchedStationsRootDto))
            : new (false, default);

    private static async Task<StationsRootDto?> FetchAllStations(IHttpClientContext context)
    {
        try
        {
            return await context.RunEndpoint(new AllStationsApiEndpoint()).ConfigureAwait(false);
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