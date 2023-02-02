namespace suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;

public record CountryDto(IEnumerable<RegionDto>? Regions, CodesDto? Codes, string? Title) : IDto;