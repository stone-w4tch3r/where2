using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API;

public class DataComposer
{
    private readonly Func<FileInfo, Task<IModel>> _stationsRepository;

    public async Task<object> GetData(FileInfo fileInfo)
    {
        var result = Enumerable.Empty<object>();
        result = result.Append(await _stationsRepository(fileInfo).ConfigureAwait(false));
        return result;
    }
}