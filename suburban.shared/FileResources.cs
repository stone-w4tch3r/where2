namespace suburban.shared;

public static class FileResources
{
    public static class Debug
    {
        public static FileInfo FetchedStationsDto { get; } = new("fetchedStationsDto.json");
        public static FileInfo FilteredStations { get; } = new("stationsFiltered.json");
        
    }
}