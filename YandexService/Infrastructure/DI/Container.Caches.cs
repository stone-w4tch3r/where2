using System.Diagnostics.CodeAnalysis;
using suburban.shared;
using YandexService.API.DataTypes;
using YandexService.Core.Cache;
using YandexService.Infrastructure.JsonConverters;

namespace YandexService.Infrastructure.DI;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Local")]
[SuppressMessage("ReSharper", "MemberCanBePrivate.Local")]
internal partial class Container
{
    private class Caches
    {
        private class Files
        {
            public FileInfo Stations { get; } = FileResources.Debug.GetFileInfo(typeof(Stations), "cached");

            public FileInfo StationsSchedule { get; } =
                FileResources.Debug.GetFileInfo(typeof(Schedule), "cached");
        }

        public Func<Task<ICachable<Stations>?>> StationsUncacher { get; }

        public Func<Task<ICachable<Schedule>?>> ScheduleUncacher { get; }

        public Func<Stations, Task> StationsCacher { get; }

        public Func<Schedule, Task> ScheduleCacher { get; }

        public Caches(Services services)
        {
            var files = new Files();

            ScheduleUncacher = () => services.Uncacher.Uncache<Schedule>(
                files.StationsSchedule,
                new JsonConcreteTypeConverter<Cachable<Schedule>>());
            StationsUncacher = () => services.Uncacher.Uncache<Stations>(
                files.Stations,
                new JsonConcreteTypeConverter<Cachable<Stations>>());
            StationsCacher = model => services.Cacher.Cache(new Cachable<Stations>(model), files.Stations);
            ScheduleCacher = model =>
                services.Cacher.Cache(new Cachable<Schedule>(model), files.StationsSchedule);
        }
    }
}