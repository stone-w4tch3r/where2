namespace suburban.shared;

public static class FileResources
{
    public static class Debug
    {
        public static FileInfo FetchedStationsRootDto { get; } = new("fetchedStationsRootDto.json");
        public static FileInfo FilteredStationsRoot { get; } = new("stationsFiltered.json");
        
    }
}