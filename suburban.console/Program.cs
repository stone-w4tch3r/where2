using Arbus.Network;
using Arbus.Network.Implementations;
using suburban.console.YandexDataService;
using suburban.console.HelperServices;

namespace suburban.console;

public static class Program
{
    public static async Task Main()
    {
        var dataWorker = new YandexDataService.YandexDataService(
            new StationsFetcher(
                new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager())),
                new StationsDtoValidator(), 
                new FileService()),
            new FileService());
        var data = await dataWorker
            .GetData(new ("stations.json"))
            .ConfigureAwait(false);

        Console.WriteLine(data);
    }
}