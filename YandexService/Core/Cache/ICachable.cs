namespace YandexService.Core.Cache;

public interface ICachable<out T>
{
    public DateTime CreationTime { get; }

    public T Content { get; }
}