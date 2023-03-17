using System.Text.Json;
using suburban.essentials;
using suburban.essentials.Extensions;
using suburban.essentials.HelperServices;
using suburban.shared;
using YandexService.API.DataTypes.Abstractions;

namespace YandexService.Core.Cache;

internal class Uncacher
{
    private readonly IFileService _fileService;

    public Uncacher(IFileService fileService)
    {
        _fileService = fileService;
    }

    public async Task<ICachable<T>?> Uncache<T>(FileInfo fileInfo) where T : IModel =>
        (await LoadFromFile<T>(fileInfo).ConfigureAwait(false))
        .Map(savable => savable?.Tap(LogCreationTime));

    private async Task<ICachable<T>?> LoadFromFile<T>(FileInfo fileInfo) where T : IModel =>
        await _fileService.LoadFromFile<ICachable<T>>(fileInfo, GetOptions<T>()).ConfigureAwait(false);

    private static void LogCreationTime<T>(ICachable<T> cachable) =>
        cachable.TapLog(StringResources.Debug.DataLoadedFromCache, cachable.CreationTime);

    private static JsonSerializerOptions GetOptions<T>() =>
        new() { Converters = { new JsonConcreteTypeConverter<Cachable<T>>() } };
}