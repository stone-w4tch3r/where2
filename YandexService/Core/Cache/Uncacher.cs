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

    public async Task<ISavable<T>?> Uncache<T>(FileInfo fileInfo) where T : IModel =>
        (await LoadFromFile<T>(fileInfo).ConfigureAwait(false))
        .Map(savable => savable?.Tap(LogCreationTime));

    private async Task<ISavable<T>?> LoadFromFile<T>(FileInfo fileInfo) where T : IModel =>
        await _fileService.LoadFromFile<ISavable<T>>(fileInfo).ConfigureAwait(false);

    private static void LogCreationTime<T>(ISavable<T> savable) =>
        savable.TapLog(StringResources.Debug.DataLoadedFromCache, savable.CreationTime);
}