using System.Data;
using Arbus.Network;
using Arbus.Network.Abstractions;
using Arbus.Network.Implementations;
using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;
using suburban.console.Extensions;
using suburban.console.HelperServices;
using suburban.essentials;
using suburban.shared;

namespace suburban.console.DataService;

public class DataService
{
    public async Task<StationsRoot> GetData() =>
        (await GetStations(
            new FileInfo("stations.json"),
            new YandexFetcher(),
            new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager())),
            new DtoValidator(),
            new FileService()
        ).ConfigureAwait(false))
        .Map(FilterTrainOnlyStations)
        .Tap(async x =>
            await new FileService().SaveToFile(x, new FileInfo("stationsFiltered.json")).ConfigureAwait(false));

    private static async Task<StationsRoot> GetStations(
        FileSystemInfo fileInfo,
        IYandexFetcher fetcher,
        IHttpClientContext context,
        IDtoValidator dtoValidator,
        IFileService fileService) =>
        await (await fileService.LoadFromFile<StationsRoot>(fileInfo).ConfigureAwait(false))
            .Map(async stationsRoot =>
                stationsRoot is { }
                && true.Log(StringResources.Debug.StationsRootLoadedFromCache, stationsRoot.CreationTime)
                && stationsRoot.CreationTime > DateTime.Now.AddDays(-1)
                    ? stationsRoot
                        .Log(StringResources.Debug.DataIsActual)
                    : await fetcher.FetchAllStations(context).ConfigureAwait(false) is { } fetchedStationsRootDto 
                      && true.LogToFile(fetchedStationsRootDto, FileResources.Debug.FetchedStationsRootDto, fileService)
                        ? dtoValidator
                            .Validate(fetchedStationsRootDto)
                            .Tap(async stations =>
                                await fileService.SaveToFile(stations, fileInfo).ConfigureAwait(false))
                        : stationsRoot
                          ?? throw new DataException(StringResources.Exceptions.FetchingAndLoadingFailed))
            .ConfigureAwait(false);
    
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
}