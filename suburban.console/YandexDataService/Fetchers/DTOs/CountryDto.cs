namespace suburban.console.YandexDataService.Fetchers.DTOs;

public record CountryDto(IEnumerable<RegionDto>? Regions, CodesDto? Codes, string? Title) : IDto;