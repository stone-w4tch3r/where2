namespace suburban.console.Records;

public record StationsRoot(Country Country)
{
    public DateTime CreationTime { get; } = DateTime.Now;
}