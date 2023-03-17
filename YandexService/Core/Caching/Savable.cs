namespace YandexService.Core.Caching;

internal record Savable<T>(T Data) : ISavable<T>
{
    public DateTime CreationTime { get; init; } = DateTime.Now;
}