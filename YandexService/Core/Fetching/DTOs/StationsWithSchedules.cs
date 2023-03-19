namespace YandexService.Core.Fetching.DTOs;

internal record StationsWithSchedules
{
    public record CountryWithSchedulesDto(
        CountryDto Country,
        IEnumerable<RegionWithSchedulesDto> Regions);
    public record RegionWithSchedulesDto(
        RegionDto Region,
        IEnumerable<SettlementWithSchedulesDto> Settlements);
    public record SettlementWithSchedulesDto(
        SettlementDto Settlement,
        IEnumerable<(StationDto, ScheduleDto)> StationsWithSchedules);

    public IEnumerable<CountryWithSchedulesDto>? Countries { get; init; }
}