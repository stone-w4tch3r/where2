using System.Text.Json;
using System.Text.Json.Serialization;
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

    public async Task<ICachable<T>?> Uncache<T>(FileInfo fileInfo, JsonConverter concreteTypeConverter)
        where T : IModel
        =>
            (await LoadFromFile<T>(fileInfo, concreteTypeConverter).ConfigureAwait(false))
            .To(savable => savable?.Do(LogCreationTime));

    private async Task<ICachable<T>?> LoadFromFile<T>(FileInfo fileInfo, JsonConverter converter) where T : IModel =>
        await _fileService.LoadFromFile<ICachable<T>>(fileInfo, GetOptions(converter)).ConfigureAwait(false);

    private static void LogCreationTime<T>(ICachable<T> cachable) =>
        cachable.TapLog(StringResources.Debug.DataLoadedFromCache, cachable.CreationTime);

    private static JsonSerializerOptions GetOptions(JsonConverter converter) =>
        new() { Converters = { converter } };
}