namespace suburban.shared;

public static class FileResources
{
    public static class Debug
    {
        public static FileInfo GetFileInfo(Type type, string prefix = "fetched") =>
            new($"{prefix}{type.Name}.json");
    }
}