namespace suburban.essentials;

public static class FunctionalExtensions
{
    public static TOut Map<TOut, TIn>(this TIn source, Func<TIn, TOut> func) => func(source);
    
    public static T Tap<T>(this T source, Action<T> action)
    {
        action(source);
        return source;
    }
    
    public static T TapIf<T>(this T source, Func<T, bool> predicate, Action<T> action) => 
        predicate(source) ? source.Tap(action) : source;
}