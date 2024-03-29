using System.Diagnostics.Tracing;
using suburban.essentials.HelperServices;

namespace suburban.essentials.Extensions;

public static class DebugExtensions
{
    public static T TapLogToFile<T>(this T obj, object saveObj, FileInfo fileInfo, IFileService fileService)
    {
        if (Settings.EventLogLevel == EventLevel.Verbose)
            fileService.SaveToFile(saveObj, fileInfo);
        return obj;
    }

    public static T? TapLogToFile<T>(this T? obj, FileInfo fileInfo, IFileService fileService)
    {
        if (Settings.EventLogLevel == EventLevel.Verbose && obj is not null)
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