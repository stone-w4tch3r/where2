using Arbus.Network.Abstractions;

namespace suburban.console;

public class NetworkManager : INetworkManager
{
    public bool IsNetworkAvailable { get; }
    public event EventHandler<bool>? NetworkAvailabilityChanged;
}