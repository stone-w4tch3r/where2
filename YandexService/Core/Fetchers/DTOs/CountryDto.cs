namespace YandexService.Core.Fetchers.DTOs;

internal record CountryDto(IEnumerable<RegionDto>? Regions, CodesDto? Codes, string? Title) : IDto;