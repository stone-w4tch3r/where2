namespace YandexService.Core.Fetchers.DTOs;

internal record RegionDto(IEnumerable<SettlementDto>? Settlements, CodesDto? Codes, string? Title) : IDto;