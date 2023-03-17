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

    public async void Cache<T>(T model, FileInfo fileInfo, Func<IModel, ICachable<IModel>> toCachable)
        where T : IModel
        =>
            await _fileService.SaveToFile(toCachable(model), fileInfo).ConfigureAwait(false);
}