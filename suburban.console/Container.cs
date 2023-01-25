using Arbus.Network;
using Arbus.Network.Abstractions;
using Arbus.Network.Implementations;
using suburban.console.DataTypes;
using suburban.console.HelperServices;
using suburban.console.YandexDataService.DataRepository;
using suburban.console.YandexDataService.Fetchers;
using suburban.console.YandexDataService.Fetchers.DtoConverters;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Filters;
using suburban.console.YandexDataService.Fetchers.DTOs;
using suburban.console.YandexDataService.Fetchers.Endpoints;

namespace suburban.console;

public class Container
{
    public IFileService FileService { get; }
    public IDataFilter<Stations> StationsFilter { get; }
    public IDtoConverter<StationsDto, Stations> StationsConverter { get; }
    public IHttpClientContext HttpClientContext { get; }
    public IDataFetcher<Stations> StationsFetcher { get; }
    public IDataRepository<Stations> StationsRepository { get; }

    public Container()
    {
        FileService = new FileService();
        StationsFilter = new StationsFilter();
        StationsConverter = new StationsConverter(StationsFilter);
        HttpClientContext = new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager()));
        StationsFetcher =
            new DataFetcher<Stations, StationsDto, StationsApiEndpoint>(
                HttpClientContext, 
                StationsConverter,
                FileService);
        StationsRepository = new DataRepository<Stations>(FileService, StationsFetcher);
    }
}