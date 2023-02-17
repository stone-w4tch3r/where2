namespace suburban.shared;

public static class StringResources
{
    public static class Debug
    {
        public const string StationsLoadedFromCache = "Data loaded from cache: [CreationTime: {0}]";
        public const string DataIsActual = "Data is actual, using cashed data";
        public const string DataIsNotValidFetching = "Data is not valid, fetching new data";
        public const string DataFetched = "Data fetched";
    }

    public static class Exceptions
    {
        public const string FetchingAndLoadingFailed = "Failed to fetch data and to load from file";
    }
}