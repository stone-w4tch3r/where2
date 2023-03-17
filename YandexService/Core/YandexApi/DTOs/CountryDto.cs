namespace YandexService.Core.YandexApi.DTOs;

internal record CountryDto(IEnumerable<RegionDto>? Regions, CodesDto? Codes, string? Title) : IDto;