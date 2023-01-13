namespace suburban.console.DataTypes;

public record Stations(Country Country)
{
    public DateTime CreationTime { get; } = DateTime.Now;
}