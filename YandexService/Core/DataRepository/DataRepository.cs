using suburban.essentials;
using YandexService.API.DataTypes.Abstractions;
using YandexService.Core.Cache;

namespace YandexService.Core.DataRepository;

internal class DataRepository
{
    public static async Task<T> GetModel<T>(
        FileInfo fileInfo,
        Func<Task<T>> fetch,
        Func<FileInfo, Task<T?>> loadFromFile)
        where T : ISavable<T>, IModel
        =>
            await fileInfo
                .MapAsync(loadFromFile)
                .MapAsync<T?, T>(async loadedData =>
                    loadedData is not null
                        ? loadedData
                        : await fetch().ConfigureAwait(false))
                .ConfigureAwait(false);
}