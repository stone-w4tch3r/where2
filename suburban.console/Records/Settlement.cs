namespace suburban.console.Records;

public record Settlement(string Title, Codes Codes, IEnumerable<Station> Stations);