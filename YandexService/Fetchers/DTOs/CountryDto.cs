namespace YandexService.Fetchers.DTOs;

public record CountryDto(IEnumerable<RegionDto>? Regions, CodesDto? Codes, string? Title) : IDto;