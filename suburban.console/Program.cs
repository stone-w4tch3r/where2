using suburban.console.YandexDataService;

namespace suburban.console;

public static class Program
{
    public static async Task Main()
    {
        var container = new Container();
        var yandexDataService = new DataComposer();
        var data = await yandexDataService
            .GetData(new (Path.Combine("saved_data", "stations.json")))
            .ConfigureAwait(false);

        Console.WriteLine(data);
    }
}