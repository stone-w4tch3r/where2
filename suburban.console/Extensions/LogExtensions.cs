using System.Diagnostics.Tracing;
using suburban.console.HelperServices;

namespace suburban.console.Extensions;

public static class DebugExtensions
{
    public static T LogToFile<T>(this T obj, object saveObj, FileInfo fileInfo, IFileService fileService)
    {
        if (Settings.EventLogLevel == EventLevel.Verbose)
            fileService.SaveToFile(saveObj, fileInfo);
        return obj;
    }
    
    public static T LogToFile<T>(this T obj, FileInfo fileInfo, IFileService fileService)
    {
        if (Settings.EventLogLevel == EventLevel.Verbose)
            fileService.SaveToFile(obj, fileInfo);
        return obj;
    }
    
    public static T Log<T>(this T obj, string message, params object?[]? args)
    {
        if (Settings.EventLogLevel == EventLevel.Verbose)
            Console.WriteLine(message, args);
        return obj;
    }
}