using suburban.console.DataTypes;
using suburban.console.YandexDataService.DataRepository;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

namespace suburban.console.YandexDataService;

public class DataComposer
{
    private readonly IDataRepository<StationsTransitType> _stationsRepository;
    
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