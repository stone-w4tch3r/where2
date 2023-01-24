using suburban.console.HelperServices;

namespace suburban.console;

public static class Program
{
    public static async Task Main()
    {
        var fileService = new FileService();
        var dataWorker = new YandexDataService.YandexDataService(fileService);
        var data = await dataWorker
            .GetData(new ("stations.json"))
            .ConfigureAwait(false);

        Console.WriteLine(data);
    }
}