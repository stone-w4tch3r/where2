namespace suburban.console.DataWorker.DTOs;

public record CountryDto(IEnumerable<RegionDto>? Regions, CodesDto? Codes, string? Title);