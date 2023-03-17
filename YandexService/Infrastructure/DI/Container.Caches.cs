using suburban.shared;
using YandexService.API.DataTypes;
using YandexService.Core.Cache;

namespace YandexService.Infrastructure.DI;

internal partial class Container
{
    private class Caches
    {
        private class Files
        {
            public FileInfo Stations { get; } = FileResources.Debug.GetFileInfo(typeof(Stations));

            public FileInfo StationsSchedule { get; } = FileResources.Debug.GetFileInfo(typeof(StationSchedule));
        }

        public Func<Task<ICachable<Stations>?>> StationsUncacher { get; }

        public Func<Task<ICachable<StationSchedule>?>> ScheduleUncacher { get; }

        public Caches(Services services)
        {
            var files = new Files();

            ScheduleUncacher = () => services.Uncacher.Uncache<StationSchedule>(files.StationsSchedule);
            StationsUncacher = () => services.Uncacher.Uncache<Stations>(files.Stations);
        }
    }
}