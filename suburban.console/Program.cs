using Arbus.Network;
using Arbus.Network.Abstractions;
using Arbus.Network.Exceptions;
using Arbus.Network.Implementations;

namespace suburban.console;

public static class Program
{
    private static readonly INetworkManager _networkManager;
    private static readonly INativeHttpClient _nativeHttpClient;
    private static readonly IHttpClientContext _httpClientContext;

    static Program()
    {
        _networkManager = new WindowsNetworkManager();
        _nativeHttpClient = new NativeHttpClient(_networkManager);
        _httpClientContext = new HttpClientContext(_nativeHttpClient);
    }

    public static async Task Main()
    {
        try
        {
            var endpoint = new AllStationsApiEndpoint();
            var stationsListDto = await _httpClientContext.RunEndpoint(endpoint).ConfigureAwait(false);
            Console.WriteLine(stationsListDto);
        }
        catch (NetworkException e)
        {
            Console.WriteLine($"{e.StatusCode}\n{e.Message}\n{e.StackTrace}");
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
        }
    }
}