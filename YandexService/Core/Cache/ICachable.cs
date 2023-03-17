namespace YandexService.Core.Cache;

public interface ICachable<T>
{
    public DateTime CreationTime { get; init; }

    public T Content { get; init; }
}