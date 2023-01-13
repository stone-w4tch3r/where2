using Arbus.Network;
using Arbus.Network.Implementations;
using suburban.console.DataTypes;
using suburban.console.HelperServices;
using suburban.console.YandexDataService.DtoConverters;
using suburban.console.YandexDataService.DTOs;
using suburban.console.YandexDataService.Endpoints;
using suburban.console.YandexDataService.Fetchers;

namespace suburban.console;

public static class Program
{
    public static async Task Main()
    {
        var fileService = new FileService();
        var dataWorker = new YandexDataService.YandexDataService(
            new DataFetcher<Stations, StationsDto, StationsApiEndpoint>(
                new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager())),
                new StationsConverter(), 
                fileService),
            fileService);
        var data = await dataWorker
            .GetData(new ("stations.json"))
            .ConfigureAwait(false);

        Console.WriteLine(data);
    }
}