
namespace suburban.console;

public static class Program
{
    public static async Task Main()
    {
        await Task.Delay(10).ConfigureAwait(false);
        await Task.Delay(10).ConfigureAwait(false);
        // var container = new Container();
        // var yandexDataService = new DataComposer();
        // var data = await yandexDataService
        //     .GetData(new (Path.Combine("saved_data", "stations.json")))
        //     .ConfigureAwait(false);
        //
        // Console.WriteLine(data);
    }
}