using Arbus.Network;
using Arbus.Network.Abstractions;
using Arbus.Network.Implementations;
using suburban.essentials.HelperServices;
using YandexService.API.DataTypes;
using YandexService.Core;
using YandexService.Core.Cache;

// ReSharper disable UnusedAutoPropertyAccessor.Local
// ReSharper disable NotAccessedField.Local
// ReSharper disable PrivateFieldCanBeConvertedToLocalVariable

namespace YandexService.Infrastructure;

internal class Container
{
    private class Fetchers
    {
        public Func<Task<Stations>> StationsFetcher { get; }
        public Func<Codes, Task<StationSchedule>> StationsScheduleFetcher { get; }

        public Fetchers(Services services)
        {
            // StationsFetcher = () => new Fetcher(services.Context, services.FileService).Fetch(new StationsEndpoint());
            // StationsScheduleFetcher = codes => new Fetcher(services.Context, services.FileService).Fetch(new StationScheduleEndpoint(codes));
        }
    }

    private class Services
    {
        public IFileService FileService { get; }
        public IHttpClientContext Context { get; }
        public Uncacher Uncacher { get; }
        public Cacher Cacher { get; }

        public Services()
        {
            FileService = new FileService();
            Context = new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager()));
            Uncacher = new(FileService);
            Cacher = new(FileService);
        }
    }

    private readonly Services _servicesContainer;
    private readonly Fetchers _fetchersContainer;
    
    public Func<FileInfo, Task<ISavable<StationSchedule>?>> ScheduleCacheLoader { get; }
    public Func<FileInfo, Task<ISavable<Stations>?>> StationsCacheLoader { get; }
    public Func<FileInfo, Task<Stations>> StationsModelLoader { get; }
    // public Func<FileInfo, Task<StationsWithSchedule>> StationsWithScheduleModelLoader { get; }
    
    public Container()
    {
        _servicesContainer = new ();
        _fetchersContainer = new (_servicesContainer);
        
        StationsCacheLoader = file => _servicesContainer.Uncacher.Uncache<Stations>(file);
        ScheduleCacheLoader = file => _servicesContainer.Uncacher.Uncache<StationSchedule>(file);
        StationsModelLoader = file => ModelLoader.GetFromCacheOrFetch(file, _fetchersContainer.StationsFetcher, StationsCacheLoader);
    }
}