using System.Data;
using System.Text.Encodings.Web;
using System.Text.Json;
using Arbus.Network;
using Arbus.Network.Implementations;
using suburban.console.DataTypes;

namespace suburban.console.DataService;

public class DataService
{
    public async Task<StationsRoot> GetData()
    {
        var fileInfo = new FileInfo("stations.json");

        var savedStations = await ProcessLoadingFromFile(fileInfo).ConfigureAwait(false);

        if (savedStations is not null && savedStations.CreationTime > DateTime.Now.AddDays(-1))
            return savedStations;

        var context = new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager()));
        var fetcher = new YandexFetcher();
        var fetchedStationsDto = await fetcher.FetchAllStations(context).ConfigureAwait(false);
        if (fetchedStationsDto is null)
        {
            if (savedStations == null)
                throw new DataException("Failed to fetch data and to load from file");
            
            Console.WriteLine("Failed to fetch data");
            return savedStations;
        }

        var validator = new DtoValidator();
        var stations = validator.Validate(fetchedStationsDto);
        await SaveToFile(stations, fileInfo).ConfigureAwait(false);
        return stations;
    }
    
    private async Task<StationsRoot?> ProcessLoadingFromFile(FileInfo fileInfo)
    {
        if (!fileInfo.Exists)
            return null;

        try
        {
            return await LoadFromFile(fileInfo).ConfigureAwait(false);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while loading from file: {e.Message}");
            return null;
        }
    }

    private async Task SaveToFile(StationsRoot stations, FileInfo fileInfo)
    {
        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
        fileInfo.Delete();
        await using var stream = File.OpenWrite(fileInfo.FullName);
        await JsonSerializer.SerializeAsync(stream, stations, options).ConfigureAwait(false);
    }

    private async Task<StationsRoot> LoadFromFile(FileInfo file)
    {
        await using var stream = File.OpenRead(file.FullName);
        return await JsonSerializer.DeserializeAsync<StationsRoot>(stream).ConfigureAwait(false)
            ?? throw new NullReferenceException($"{file.FullName} deserialize failed");
    }
}