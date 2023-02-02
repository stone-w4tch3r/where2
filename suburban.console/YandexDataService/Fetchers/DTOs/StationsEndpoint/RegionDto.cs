namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public record RegionDto(IEnumerable<SettlementDto>? Settlements, CodesDto? Codes, string? Title) : IDto;