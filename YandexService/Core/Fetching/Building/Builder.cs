// using suburban.essentials;
// using YandexService.Core.Fetching.DTOs;
//
// namespace YandexService.Core.Fetching.Building;
//
// internal class Builder
// {
//     public async Task<StationsDto> Build(
//         Func<Task<StationsDto>> getStations,
//         Func<StationsDto, StationsDto> filterStations,
//         Func<string, Task<StationScheduleDto>> getStationSchedule)
//         =>
//             await getStations()
//                 .ToAsync(filterStations)
//                 .ToAsync(dto => 
//                     dto.Countries.Select(country => 
//                         country.Regions.Select(region => 
//                             region.Settlements.Select(settlement => 
//                                 settlement.Stations.Select(station => 
//                                     getStationSchedule(station.Codes.YandexCode)
//                                         .ToAsync(schedule => 
//                                             station.SetSchedule(schedule)))))))
//                 .ToAsync(_ => Task.FromResult(new StationsDto(null!)));
//
// }