using System.Diagnostics.CodeAnalysis;
using suburban.essentials;
using YandexService.API.DataTypes.Abstractions;
using YandexService.Core.Cache;

namespace YandexService.Core;

internal class ModelProvider
{
    public static async Task<T> UncacheOrFetch<T>(
        FileInfo fileInfo,
        Func<FileInfo, Task<ICachable<T>?>> uncache,
        Func<Task<T>> fetch)
        where T : IModel
        =>
            await fileInfo
                .MapAsync(uncache)
                .MapAsync(cachable => IsValid(cachable) ? cachable.Data : default)
                .MapAsync<T?, T>(async loadedData => loadedData ?? await fetch().ConfigureAwait(false))
                .ConfigureAwait(false);

    private static bool IsValid<T>([NotNullWhen(true)] ICachable<T>? savable) =>
        savable is not null && savable.CreationTime > DateTime.Now.AddDays(-1);
}