using suburban.essentials.HelperServices;
using YandexService.API.DataTypes.Abstractions;

namespace YandexService.Core.Caching;

public class Saver
{
    private readonly IFileService _fileService;
    private readonly Func<IModel, ISavable<IModel>> _toSavable;

    public Saver(IFileService fileService, Func<IModel, ISavable<IModel>> toSavable)
    {
        _fileService = fileService;
        _toSavable = toSavable;
    }

    public async void Save(IModel model, FileInfo fileInfo) =>
        await _fileService.SaveToFile(_toSavable(model), fileInfo).ConfigureAwait(false);
}