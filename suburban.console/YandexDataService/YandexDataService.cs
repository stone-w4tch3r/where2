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
    private readonly IStationsFetcher _stationsFetcher;

    public YandexDataService(IStationsFetcher stationsFetcher, IFileService fileService)
    {
        _stationsFetcher = stationsFetcher;
        _fileService = fileService;
    }

    public async Task<Stations> GetData(
        FileInfo fileInfo) =>
        (await GetStations(fileInfo).ConfigureAwait(false))
        .Map(FilterTrainOnlyStations)
        .LogToFile(FileResources.Debug.FilteredStations, _fileService);

    private async Task<Stations> GetStations(
        FileInfo fileInfo)
    {
        return await (await _fileService.LoadFromFile<Stations>(fileInfo).ConfigureAwait(false))
            .Map(async stations =>
                stations is { }
                && true.Log(StringResources.Debug.StationsLoadedFromCache, stations.CreationTime)
                && stations.CreationTime > DateTime.Now.AddDays(-1)
                    ? stations.Log(StringResources.Debug.DataIsActual)
                    : await _stationsFetcher.TryFetchAllStations().ConfigureAwait(false)
                        is { IsSuccess: true } fetchedStations
                        ? fetchedStations.Value!.Tap(SaveLoadedStationsToFile)
                        : stations ?? throw new DataException(StringResources.Exceptions.FetchingAndLoadingFailed))
            .ConfigureAwait(false);

        async void SaveLoadedStationsToFile(Stations stations) =>
            await _fileService.SaveToFile(stations, fileInfo).ConfigureAwait(false);
    }

    private static Stations FilterTrainOnlyStations(Stations stations) =>
        stations with
        {
            Country = stations.Country with
            {
                Regions = stations.Country.Regions.Select(region => region with
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