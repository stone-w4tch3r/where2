using YandexService.API.DataTypes;

namespace YandexService.Infrastructure.DI;

internal partial class Container
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
}