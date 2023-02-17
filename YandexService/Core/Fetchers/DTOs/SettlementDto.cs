namespace YandexService.Core.Fetchers.DTOs;

public record SettlementDto(string? Title, CodesDto? Codes, IEnumerable<StationDto>? Stations) : IDto;