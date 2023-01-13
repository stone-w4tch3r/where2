namespace suburban.console.DataTypes;

public record Stations(Country Country) : IDataType
{
    public DateTime CreationTime { get; } = DateTime.Now;
}