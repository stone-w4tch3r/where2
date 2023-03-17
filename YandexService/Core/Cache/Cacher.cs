using suburban.essentials.HelperServices;
using YandexService.API.DataTypes.Abstractions;

namespace YandexService.Core.Cache;

internal class Cacher
{
    private readonly IFileService _fileService;

    public Cacher(IFileService fileService)
    {
        _fileService = fileService;
    }

    public async void Cache<T>(T model, FileInfo fileInfo, Func<IModel, ISavable<IModel>> toSavable) where T : IModel=>
        await _fileService.SaveToFile(toSavable(model), fileInfo).ConfigureAwait(false);
}