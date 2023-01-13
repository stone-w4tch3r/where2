namespace suburban.console.YandexDataService.DTOs;

public record RegionDto(IEnumerable<SettlementDto>? Settlements, CodesDto? Codes, string? Title);