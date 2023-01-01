using System.Data;
using System.Diagnostics.Tracing;
using System.Text.Encodings.Web;
using System.Text.Json;
using Arbus.Network;
using Arbus.Network.Abstractions;
using Arbus.Network.Implementations;
using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;
using suburban.essentials;

namespace suburban.console.DataService;

public class DataService
{
    public async Task<StationsRoot> GetData() =>
        (await GetStations(
            new FileInfo("stations.json"),
            new YandexFetcher(),
            new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager()))
        ).ConfigureAwait(false))
        .Map(FilterTrainOnlyStations)
        .Tap(LogFilteredStations);

    private static StationsRoot FilterTrainOnlyStations(StationsRoot stationsRoot) =>
        stationsRoot with
        {
            Country = stationsRoot.Country with
            {
                Regions = stationsRoot.Country.Regions.Select(region => region with
                {
                    Settlements =
                    region.Settlements.Select(settlement => settlement with
                    {
                        Stations = settlement.Stations
                            .Where(station => station.TransportType is TransportType.Suburban or TransportType.Train)
                    }).Where(settlement => settlement.Stations.Any())
                }).Where(x => x.Settlements.Any())
            }
        };
    
    private static async void LogFilteredStations(StationsRoot x)
    {
        if (Settings.EventLogLevel == EventLevel.Verbose)
            await SaveToFile(x, new FileInfo("stationsFiltered.json")).ConfigureAwait(false);
    }

    private async Task<StationsRoot> GetStations(FileSystemInfo fileInfo, IYandexFetcher fetcher, IHttpClientContext context)
    {
        // var savedStations = default(StationsRoot);
        var savedStations = await ProcessLoadingFromFile(fileInfo).ConfigureAwait(false);

        if (savedStations is not null)
            Console.WriteLine($"Data found: [CreationTime: {savedStations.CreationTime}]");

        if (savedStations is not null && savedStations.CreationTime > DateTime.Now.AddDays(-1))
        {
            Console.WriteLine("Data is actual, loading from file");
            return savedStations;
        }

        var fetchedStationsDto = await fetcher.FetchAllStations(context).ConfigureAwait(false);
        if (fetchedStationsDto is null)
        {
            if (savedStations == null)
                throw new DataException("Failed to fetch data and to load from file");

            Console.WriteLine("Failed to fetch data, loading from file");
            return savedStations;
        }

        var validator = new DtoValidator();
        var stations = validator.Validate(fetchedStationsDto);
        Console.WriteLine("Data fetched");
        if(Settings.EventLogLevel == EventLevel.Verbose)
            await SaveToFile(fetchedStationsDto, new FileInfo("fetchedDto.json")).ConfigureAwait(false);
        await SaveToFile(stations, fileInfo).ConfigureAwait(false);
        return stations;
    }

    private static async Task<StationsRoot?> ProcessLoadingFromFile(FileSystemInfo fileInfo)
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

    private static async Task SaveToFile(object data, FileSystemInfo fileInfo)
    {
        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
        fileInfo.Delete();
        await using var stream = File.OpenWrite(fileInfo.FullName);
        await JsonSerializer.SerializeAsync(stream, data, options).ConfigureAwait(false);
    }

    private static async Task<StationsRoot> LoadFromFile(FileSystemInfo file)
    {
        await using var stream = File.OpenRead(file.FullName);
        return await JsonSerializer.DeserializeAsync<StationsRoot>(stream).ConfigureAwait(false)
               ?? throw new NullReferenceException($"{file.FullName} deserialize failed");
    }
}