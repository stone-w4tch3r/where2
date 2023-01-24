namespace suburban.console.YandexDataService.Filters;

public interface IDataFilter<T>
{
    public T Filter(T data);
}