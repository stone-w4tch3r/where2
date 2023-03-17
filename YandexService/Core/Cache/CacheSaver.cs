using suburban.essentials.HelperServices;
using YandexService.API.DataTypes.Abstractions;

namespace YandexService.Core.Cache;

internal class CacheSaver
{
    private readonly IFileService _fileService;

    public CacheSaver(IFileService fileService)
    {
        _fileService = fileService;
    }

    public async void Save<T>(T model, FileInfo fileInfo, Func<IModel, ISavable<IModel>> toSavable) where T : IModel=>
        await _fileService.SaveToFile(toSavable(model), fileInfo).ConfigureAwait(false);
}