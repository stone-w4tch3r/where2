namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public record SettlementDto(string? Title, CodesDto? Codes, IEnumerable<StationsDto.StationDto>? Stations) : IDto;