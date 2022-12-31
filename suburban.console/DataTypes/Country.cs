namespace suburban.console.DataTypes;

public record Country(string Title, Codes Codes, IEnumerable<Region> Regions);