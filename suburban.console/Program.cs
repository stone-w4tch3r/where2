namespace suburban.console;

public static class Program
{
    public static async Task Main()
    {
        var dataWorker = new DataService.DataService();
        var data = await dataWorker.GetData().ConfigureAwait(false);

        Console.WriteLine(data);
    }
}