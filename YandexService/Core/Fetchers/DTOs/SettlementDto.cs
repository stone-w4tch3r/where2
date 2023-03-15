namespace YandexService.Core.Fetchers.DTOs;

internal record SettlementDto(string? Title, CodesDto? Codes, IEnumerable<StationDto>? Stations) : IDto;