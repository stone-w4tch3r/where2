using System.Data;
using System.Diagnostics.CodeAnalysis;
using suburban.essentials;
using YandexService.API.DataTypes.Abstractions;
using YandexService.Core.Cache;

namespace YandexService.Core;

internal class ModelProvider
{
    public static async Task<T> UncacheOrFetch<T>(
        Func<Task<ICachable<T>?>> uncache,
        Func<Task<T?>> fetch)
        where T : class, IModel
        =>
            await uncache()
                .ToAsync(cachable => IsValid(cachable)
                    ? new Result<T>(true, cachable.Content)
                    : new(false, cachable?.Content))
                .ToAsync(async result =>
                    result.IsSuccess
                        ? (value: result.Value, fallback: null)
                        : (value: await fetch().ConfigureAwait(false), fallback: result.Value))
                .ToAsync(tuple => tuple.value ?? (tuple.fallback ?? throw new DataException()))
                .ConfigureAwait(false);

    private static bool IsValid<T>([NotNullWhen(true)] ICachable<T>? savable) =>
        savable is not null && savable.CreationTime > DateTime.Now.AddDays(-1);
}