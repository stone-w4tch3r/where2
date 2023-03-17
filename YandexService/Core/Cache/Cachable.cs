namespace YandexService.Core.Cache;

internal record Cachable<T>(T Content) : ICachable<T>
{
    public DateTime CreationTime { get; init; } = DateTime.Now;
}