namespace suburban.console.DataWorker.DTOs;

public record SettlementDto(string? Title, CodesDto? Codes, IEnumerable<StationDto>? Stations);