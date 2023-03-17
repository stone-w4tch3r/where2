using YandexService.API.DataTypes;
using YandexService.Core.Fetching;
using YandexService.Core.Fetching.Endpoints;

namespace YandexService.Infrastructure.DI;

internal partial class Container
{
    private class Fetchers
    {
        public Func<Task<Stations?>> StationsFetcher { get; }

        // public Func<Codes, Task<StationSchedule>> StationsScheduleFetcher { get; }

        public Fetchers(Services services, Mappers mappers)
        {
            StationsFetcher = () => new Fetcher(services.Context, services.FileService).Fetch(new StationsEndpoint(), mappers.StationsMapper);
            // StationsScheduleFetcher = codes => new Fetcher(services.Context, services.FileService).Fetch(new StationScheduleEndpoint(codes));
        }
    }
}