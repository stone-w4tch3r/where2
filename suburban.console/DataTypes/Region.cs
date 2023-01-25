using suburban.console.DataTypes.Abstractions;

namespace suburban.console.DataTypes;

public record Region(string Title, Codes Codes, IEnumerable<Settlement> Settlements) : IDataType;