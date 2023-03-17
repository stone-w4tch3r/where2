namespace YandexService.Core.YandexApi.DTOs;

internal record RegionDto(IEnumerable<SettlementDto>? Settlements, CodesDto? Codes, string? Title) : IDto;