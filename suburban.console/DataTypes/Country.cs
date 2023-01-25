using suburban.console.DataTypes.Abstractions;

namespace suburban.console.DataTypes;

public record Country(string Title, Codes Codes, IEnumerable<Region> Regions) : IDataType;