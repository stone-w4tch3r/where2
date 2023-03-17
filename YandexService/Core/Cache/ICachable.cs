namespace YandexService.Core.Cache;

public interface ICachable<T>
{
    public DateTime CreationTime { get; }

    public T Content { get; }
}