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

    public async Task Cache<T>(ICachable<T> model, FileInfo fileInfo)
        where T : IModel
        =>
            await _fileService.SaveToFile(model, fileInfo).ConfigureAwait(false);
}