using Arbus.Network.Abstractions;
using suburban.console.DataService.DTOs;

namespace suburban.console.DataService;

public interface IYandexFetcher
{
    public Task<StationsRootDto?> FetchAllStations(IHttpClientContext context);
}