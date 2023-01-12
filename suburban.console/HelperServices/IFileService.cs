namespace suburban.console.HelperServices;

public interface IFileService
{
    public Task<T?> LoadFromFile<T>(FileInfo fileInfo) where T : class;
    public Task SaveToFile(object data, FileInfo fileInfo);
}