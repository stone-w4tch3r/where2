namespace YandexService.Core.Fetching.DTOs;

internal record CountryDto(IEnumerable<RegionDto>? Regions, CodesDto? Codes, string? Title) : IDto;