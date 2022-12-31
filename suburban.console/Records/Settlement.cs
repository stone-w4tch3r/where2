using suburban.console.DataWorker.DTOs;

namespace suburban.console.Records;

public record Settlement(string Title, Codes Codes, IEnumerable<Station> Stations);