namespace YandexService.Core.Fetching.DTOs;

internal record SettlementDto(string? Title, CodesDto? Codes, IEnumerable<StationDto>? Stations) : IDto;