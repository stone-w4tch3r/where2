namespace YandexService.Core.Fetchers.DtoConverters.Filters;

internal interface IDataFilter<T>
{
    public T Filter(T data);
}