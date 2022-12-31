namespace suburban.console.DataWorker.DTOs;

public record RegionDto(IEnumerable<SettlementDto>? Settlements, CodesDto? Codes, string? Title);