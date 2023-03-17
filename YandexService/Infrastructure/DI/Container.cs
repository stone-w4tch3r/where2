using YandexService.API.DataTypes;
using YandexService.Core;

namespace YandexService.Infrastructure.DI;

internal partial class Container
{
    public Func<Task<Stations>> StationsProvider { get; }
    // public Func<FileInfo, Task<StationsWithSchedule>> StationsWithScheduleModelLoader { get; }

    public Container()
    {
        var services = new Services();
        var mappers = new Mappers();
        var fetchers = new Fetchers(services, mappers);
        var caches = new Caches(services);

        StationsProvider = () => ModelProvider.UncacheOrFetch(caches.StationsUncacher, fetchers.StationsFetcher);
    }
}