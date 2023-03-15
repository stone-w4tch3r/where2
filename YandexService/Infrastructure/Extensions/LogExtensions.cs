using System.Diagnostics.Tracing;
using suburban.essentials;
using suburban.essentials.HelperServices;

namespace YandexService.Infrastructure.Extensions;

internal static class DebugExtensions
{
    public static T TapLogToFile<T>(this T obj, object saveObj, FileInfo fileInfo, IFileService fileService)
    {
        if (Settings.EventLogLevel == EventLevel.Verbose)
            fileService.SaveToFile(saveObj, fileInfo);
        return obj;
    }

    public static T TapLogToFile<T>(this T obj, FileInfo fileInfo, IFileService fileService)
        where T : notnull
    {
        if (Settings.EventLogLevel == EventLevel.Verbose)
            fileService.SaveToFile(obj, fileInfo);
        return obj;
    }

    public static T TapLog<T>(this T obj, string message, params object?[]? args)
    {
        if (Settings.EventLogLevel == EventLevel.Verbose)
            Console.WriteLine(message, args);
        return obj;
    }
}