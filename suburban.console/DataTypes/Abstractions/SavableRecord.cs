namespace suburban.console.DataTypes.Abstractions;

public abstract record SavableRecord
{
    // ReSharper disable once AutoPropertyCanBeMadeGetOnly.Global - for json deserialization
    public DateTime CreationTime { get; init; } = DateTime.Now;
}