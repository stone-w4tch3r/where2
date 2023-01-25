using suburban.console.DataTypes.Abstractions;

namespace suburban.console.DataTypes;

public record Settlement(string Title, Codes Codes, IEnumerable<Station> Stations) : IDataType;