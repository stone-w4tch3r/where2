using suburban.console.DataTypes.Abstractions;

namespace suburban.console.DataTypes;

public record Stations(Country Country) : SavableRecord, IDataType;