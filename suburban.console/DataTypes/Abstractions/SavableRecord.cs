namespace suburban.console.DataTypes.Abstractions;

public abstract record SavableRecord
{
    // ReSharper disable once AutoPropertyCanBeMadeGetOnly.Global
    public DateTime CreationTime { get; init; } = DateTime.Now;
}