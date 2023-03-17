namespace YandexService.Core.Cache;

public interface ISavable<T>
{
    public DateTime CreationTime { get; init; }
    
    public T Data { get; init; }
}