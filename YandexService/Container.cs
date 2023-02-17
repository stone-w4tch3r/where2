using Arbus.Network;
using Arbus.Network.Abstractions;
using Arbus.Network.Implementations;
using suburban.essentials.HelperServices;
using YandexService.DataTypes;
using YandexService.Fetchers;
using YandexService.Fetchers.DtoConverters;
using YandexService.Fetchers.DtoConverters.Filters;
using YandexService.Fetchers.DTOs;
using YandexService.Fetchers.Endpoints;

namespace YandexService;

public class Container
{
    public IFileService FileService { get; }
    public IDataFilter<Stations> StationsFilter { get; }
    public IDtoConverter<StationsDto, Stations> StationsConverter { get; }
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