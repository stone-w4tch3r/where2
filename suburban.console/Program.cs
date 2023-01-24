using suburban.console.YandexDataService;

namespace suburban.console;

public static class Program
{
    public static async Task Main()
    {
        var container = new Container();
        var yandexDataService = new DataComposer(container.StationsRepository);
        var data = await yandexDataService
            .GetData(new ("stations.json"))
            .ConfigureAwait(false);

        Console.WriteLine(data);
    }
}