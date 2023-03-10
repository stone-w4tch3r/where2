namespace YandexService.Core.Fetchers.DTOs;

public record RegionDto(IEnumerable<SettlementDto>? Settlements, CodesDto? Codes, string? Title) : IDto;