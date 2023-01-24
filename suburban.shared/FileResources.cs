namespace suburban.shared;

public static class FileResources
{
    public static class Debug
    {
        public static FileInfo GetFileInfoForFetchedType(Type type) => new($"fetched{type.Name}.json");
    }
}