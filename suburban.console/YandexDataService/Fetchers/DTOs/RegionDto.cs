namespace suburban.console.YandexDataService.Fetchers.DTOs;

public record RegionDto(IEnumerable<SettlementDto>? Settlements, CodesDto? Codes, string? Title) : IDto;