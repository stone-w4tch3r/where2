namespace suburban.essentials;

public static class FunctionalExtensions
{
    public static TOut To<TIn, TOut>(this TIn source, Func<TIn, TOut> func) => func(source);

    public static async Task<TOut> ToAsync<TIn, TOut>(this TIn source, Func<TIn, Task<TOut>> func) =>
        await func(source).ConfigureAwait(false);

    public static async Task<TOut> ToAsync<TIn, TOut>(this Task<TIn> source, Func<TIn, Task<TOut>> func) =>
        await func(await source.ConfigureAwait(false)).ConfigureAwait(false);

    public static async Task<TOut> ToAsync<TIn, TOut>(this Task<TIn> source, Func<TIn, TOut> func) =>
        func(await source.ConfigureAwait(false));
    
    public static TOut? ToOrNull<TIn, TOut>(this TIn? source, Func<TIn, TOut> func) where TOut : class => 
        source is not null ? func(source) : null;

    public static T Do<T>(this T source, Action<T> action)
    {
        action(source);
        return source;
    }

    public static async Task<T> DoAsync<T>(this T source, Func<T, Task> action)
    {
        await action(source).ConfigureAwait(false);
        return source;
    }
}