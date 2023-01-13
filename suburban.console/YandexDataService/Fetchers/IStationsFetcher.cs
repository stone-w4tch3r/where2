using suburban.console.DataTypes;
using suburban.essentials;

namespace suburban.console.YandexDataService.Fetchers;

public interface IStationsFetcher
{
    public Task<Result<Stations>> TryFetchAllStations();
}