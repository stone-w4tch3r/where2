using Arbus.Network.Abstractions;
using suburban.console.YandexDataService.DTOs;
using suburban.console.DataTypes;
using suburban.console.HelperServices;
using suburban.essentials;

namespace suburban.console.YandexDataService;

public interface IYandexFetcher
{
    public Task<Result<StationsRoot>> TryFetchAllStations();
}