namespace suburban.console.YandexDataService.DTOs;

public record CountryDto(IEnumerable<RegionDto>? Regions, CodesDto? Codes, string? Title);