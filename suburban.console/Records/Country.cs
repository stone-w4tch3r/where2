namespace suburban.console.Records;

public record Country(string Title, Codes Codes, IEnumerable<Region> Regions);