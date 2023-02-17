using YandexService.API.DataTypes;
using YandexService.Core.DataRepository;

namespace YandexService.API;

public class DataComposer
{
    private readonly IDataRepository<Stations> _stationsRepository;
    
    // public DataComposer(
    //     IDataRepository<Stations> stationsRepository)
    // {
    //     _stationsRepository = stationsRepository;
    // }

    public async Task<object> GetData(FileInfo fileInfo)
    {
        var result = Enumerable.Empty<object>();
        result = result.Append(await _stationsRepository.GetData(fileInfo).ConfigureAwait(false));
        return result;
    }
}