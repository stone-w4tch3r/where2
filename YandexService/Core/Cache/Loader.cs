using System.Diagnostics.CodeAnalysis;
using suburban.essentials;
using suburban.essentials.Extensions;
using suburban.essentials.HelperServices;
using suburban.shared;
using YandexService.API.DataTypes.Abstractions;

namespace YandexService.Core.Cache;

public class Loader
{
    private readonly IFileService _fileService;

    public Loader(IFileService fileService)
    {
        _fileService = fileService;
    }

    public async Task<T?> Load<T>(FileInfo fileInfo) where T : IModel =>
        (await LoadFromFile<T>(fileInfo).ConfigureAwait(false))
        .Map(savable =>
            IsValid(savable)
                ? savable.Tap(LogCreationTime).Data
                : default);
    
    private async Task<ISavable<T>?> LoadFromFile<T>(FileInfo fileInfo) where T : IModel =>
        await _fileService.LoadFromFile<ISavable<T>>(fileInfo).ConfigureAwait(false);

    private static bool IsValid<T>([NotNullWhen(true)] ISavable<T>? model) where T : IModel =>
        model is { } && model.CreationTime > DateTime.Now.AddDays(-1);

    private static void LogCreationTime<T>(ISavable<T> savable) =>
        savable.TapLog(StringResources.Debug.DataLoadedFromCache, savable.CreationTime);
}