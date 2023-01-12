using Arbus.Network.Abstractions;
using suburban.console.DataService.DTOs;
using suburban.console.DataTypes;
using suburban.console.HelperServices;
using suburban.essentials;

namespace suburban.console.DataService;

public interface IYandexFetcher
{
    public Task<Result<StationsRoot>> TryFetchAllStations();
}