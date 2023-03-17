namespace YandexService.Core.YandexApi.DTOs;

internal record SettlementDto(string? Title, CodesDto? Codes, IEnumerable<StationDto>? Stations) : IDto;