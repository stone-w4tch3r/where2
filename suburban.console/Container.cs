using Arbus.Network;
using Arbus.Network.Abstractions;
using Arbus.Network.Implementations;
using suburban.console.HelperServices;
using suburban.console.YandexDataService.Fetchers;
using suburban.console.YandexDataService.Fetchers.DtoConverters;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Filters;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;
using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;
using suburban.console.YandexDataService.Fetchers.Endpoints;

namespace suburban.console;

public class Container
{
    public IFileService FileService { get; }
    public IDataFilter<StationsTransitType> StationsFilter { get; }
    public IDtoConverter<StationsDto, StationsTransitType> StationsConverter { get; }
    public IHttpClientContext HttpClientContext { get; }
    public IDataFetcher<StationsDto> StationsFetcher { get; }
    // public IDataRepository<Stations> StationsRepository { get; }

    public Container()
    {
        FileService = new FileService();
        StationsFilter = new StationsFilter();
        StationsConverter = new StationsConverter(StationsFilter);
        HttpClientContext = new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager()));
        StationsFetcher =
            new DataFetcher<StationsDto, StationsApiEndpoint>(
                HttpClientContext,
                FileService);
        // StationsRepository = new DataRepository<Stations>(FileService, StationsFetcher);
    }
}