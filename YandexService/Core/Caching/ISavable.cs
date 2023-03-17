namespace YandexService.Core.Caching;

public interface ISavable<T>
{
    public DateTime CreationTime { get; init; }
    
    public T Data { get; init; }
}