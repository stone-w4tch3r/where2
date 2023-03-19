using YandexService.API.DataTypes;
using YandexService.Core;

namespace YandexService.Infrastructure.DI;

internal partial class Container
{
    public Func<Task<Stations>> StationsProvider { get; }
    public Func<Codes, Task<Schedule>> StationScheduleProvider { get; }

    public Container()
    {
        var services = new Services();
        var mappers = new Mappers();
        var caches = new Caches(services);
        var fetchers = new Fetchers(services, mappers, caches);

        StationsProvider = () => ModelProvider.UncacheOrFetch(caches.StationsUncacher, fetchers.StationsFetcher);
        StationScheduleProvider = codes => ModelProvider.UncacheOrFetch(caches.ScheduleUncacher, () => fetchers.StationsScheduleFetcher(codes));
    }
}