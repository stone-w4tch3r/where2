using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using suburban.console.DataService.DTOs;

namespace suburban.console.DataService;

public class YandexFetcher
{
    public async Task<StationsRootDto?> FetchAllStations(IHttpClientContext context)
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