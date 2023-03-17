using YandexService.API.DataTypes;
using YandexService.Core;

// ReSharper disable UnusedAutoPropertyAccessor.Local
// ReSharper disable NotAccessedField.Local
// ReSharper disable PrivateFieldCanBeConvertedToLocalVariable

namespace YandexService.Infrastructure.DI;

internal partial class Container
{
    private readonly Caches _cacheContainer;
    private readonly Fetchers _fetchersContainer;
    private readonly Services _servicesContainer;
    private readonly Mappers _mappersContainer;

    public Func<Task<Stations>> StationsProvider { get; }
    // public Func<FileInfo, Task<StationsWithSchedule>> StationsWithScheduleModelLoader { get; }

    public Container()
    {
        _servicesContainer = new();
        _fetchersContainer = new(_servicesContainer);
        _cacheContainer = new(_servicesContainer);
        _mappersContainer = new(_servicesContainer);

        StationsProvider = () =>
            ModelProvider.UncacheOrFetch(
                _cacheContainer.StationsUncacher, 
                async () => _mappersContainer.StationsMapper(await _fetchersContainer.StationsFetcher())));
    }
}