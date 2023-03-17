namespace YandexService.Core.Cache;

internal record Cachable<T>(T Data) : ICachable<T>
{
    public DateTime CreationTime { get; init; } = DateTime.Now;

    public T Content { get; init; }
}