using System.Data;
using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;
using suburban.console.Extensions;
using suburban.console.HelperServices;
using suburban.essentials;
using suburban.shared;

namespace suburban.console.YandexDataService;

public class YandexDataService
{
    private readonly IFileService _fileService;
    private readonly IYandexFetcher _yandexFetcher;

    public YandexDataService(IYandexFetcher yandexFetcher, IFileService fileService)
    {
        _yandexFetcher = yandexFetcher;
        _fileService = fileService;
    }

    public async Task<StationsRoot> GetData(
        FileInfo fileInfo) =>
        (await GetStations(fileInfo).ConfigureAwait(false))
        .Map(FilterTrainOnlyStations)
        .LogToFile(FileResources.Debug.FilteredStationsRoot, _fileService);

    private async Task<StationsRoot> GetStations(
        FileInfo fileInfo)
    {
        return await (await _fileService.LoadFromFile<StationsRoot>(fileInfo).ConfigureAwait(false))
            .Map(async stationsRoot =>
                stationsRoot is { }
                && true.Log(StringResources.Debug.StationsRootLoadedFromCache, stationsRoot.CreationTime)
                && stationsRoot.CreationTime > DateTime.Now.AddDays(-1)
                    ? stationsRoot.Log(StringResources.Debug.DataIsActual)
                    : await _yandexFetcher.TryFetchAllStations().ConfigureAwait(false)
                        is { IsSuccess: true } fetchedStations
                        ? fetchedStations.Value!.Tap(SaveLoadedStationsToFile)
                        : stationsRoot ?? throw new DataException(StringResources.Exceptions.FetchingAndLoadingFailed))
            .ConfigureAwait(false);

        async void SaveLoadedStationsToFile(StationsRoot stations) =>
            await _fileService.SaveToFile(stations, fileInfo).ConfigureAwait(false);
    }

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