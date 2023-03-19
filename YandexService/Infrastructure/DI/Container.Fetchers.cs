using YandexService.API.DataTypes;
using YandexService.Core.Fetching;
using YandexService.Core.Fetching.DTOs;
using YandexService.Core.Fetching.Endpoints;

namespace YandexService.Infrastructure.DI;

internal partial class Container
{
    private class Fetchers
    {
        public Func<Task<Stations?>> StationsFetcher { get; }

        public Func<Codes, Task<Schedule?>> StationsScheduleFetcher { get; }
        
        // Func<StationsDto, Stations>

        public Fetchers(Services services, Mappers mappers, Caches caches)
        {
            StationsFetcher = () =>
                new Fetcher(services.Context, services.FileService)
                    .Fetch(
                        new StationsEndpoint(),
                        mappers.StationsMapper,
                        caches.StationsCacher);
            StationsScheduleFetcher = codes => new Fetcher(services.Context, services.FileService)
                .Fetch(
                    new StationScheduleEndpoint(codes),
                    mappers.ScheduleMapper,
                    caches.ScheduleCacher);
        }
    }
}