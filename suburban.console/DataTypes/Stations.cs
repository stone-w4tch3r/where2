namespace suburban.console.DataTypes;

public record Stations(Country Country) : SavableRecord, IDataType
{
}

public abstract record SavableRecord
{
    public DateTime CreationTime { get; init; } = DateTime.Now;
}