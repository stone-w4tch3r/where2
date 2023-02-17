namespace suburban.essentials.Exceptions;

public class NRE : NullReferenceException
{
    public NRE(string? message) : base(message)
    {
    }

    public NRE(string? message, Exception? exception) : base(message, exception)
    {
    }
}