namespace suburban.console.HelperServices;

public interface IFileService
{
    public Task<T?> LoadFromFile<T>(FileSystemInfo fileInfo) where T : class;
    public Task SaveToFile(object data, FileSystemInfo fileInfo);
}