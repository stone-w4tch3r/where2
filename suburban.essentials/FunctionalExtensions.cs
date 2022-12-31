namespace suburban.essentials;

public static class FunctionalExtensions
{
    public static void ForEach<T>(this IEnumerable<T> source, Action<T> action)
    {
        foreach (var item in source)
        {
            action(item);
        }
    }
    
    public static TOut Map<TOut, TIn>(this TIn source, Func<TIn, TOut> func) => func(source);
}