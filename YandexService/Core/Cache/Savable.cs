namespace YandexService.Core.Cache;

internal record Savable<T>(T Data) : ISavable<T>
{
    public DateTime CreationTime { get; init; } = DateTime.Now;
}