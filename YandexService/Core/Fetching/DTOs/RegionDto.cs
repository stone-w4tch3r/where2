namespace YandexService.Core.Fetching.DTOs;

internal record RegionDto(IEnumerable<SettlementDto>? Settlements, CodesDto? Codes, string? Title) : IDto;