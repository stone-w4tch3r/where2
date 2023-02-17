namespace YandexService.Fetchers.DtoConverters.Filters;

public interface IDataFilter<T>
{
    public T Filter(T data);
}