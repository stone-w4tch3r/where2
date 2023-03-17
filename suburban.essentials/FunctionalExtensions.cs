namespace suburban.essentials;

public static class FunctionalExtensions
{
    public static TOut Map<TOut, TIn>(this TIn source, Func<TIn, TOut> func) => func(source);
    
    public static async Task<TOut> MapAsync<TIn, TOut>(this TIn source, Func<TIn, Task<TOut>> func) => 
        await func(source).ConfigureAwait(false);
    
    public static async Task<TOut> MapAsync<TIn, TOut>(this Task<TIn> source, Func<TIn, Task<TOut>> func) => 
        await func(await source.ConfigureAwait(false)).ConfigureAwait(false);

    public static T Tap<T>(this T source, Action<T> action)
    {
        action(source);
        return source;
    }

    public static async Task<T> TapAsync<T>(this T source, Func<T, Task> action)
    {
        await action(source).ConfigureAwait(false);
        return source;
    }

    public static T TapIf<T>(this T source, Func<T, bool> predicate, Action<T> action) =>
        predicate(source) ? source.Tap(action) : source;
}