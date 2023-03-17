using System.Diagnostics.CodeAnalysis;
using suburban.essentials;
using YandexService.API.DataTypes.Abstractions;
using YandexService.Core.Cache;

namespace YandexService.Core;

internal class ModelLoader
{
    public static async Task<T> GetFromCacheOrFetch<T>(
        FileInfo fileInfo,
        Func<Task<T>> fetch,
        Func<FileInfo, Task<ISavable<T>?>> loadFromFile)
        where T : IModel
        =>
            await fileInfo
                .MapAsync(loadFromFile)
                .MapAsync(savable => IsValid(savable) ? savable.Data : default)
                .MapAsync<T?, T>(async loadedData => loadedData ?? await fetch().ConfigureAwait(false))
                .ConfigureAwait(false);

    private static bool IsValid<T>([NotNullWhen(true)] ISavable<T>? savable) =>
        savable is not null && savable.CreationTime > DateTime.Now.AddDays(-1);
}