using System.Text.Json;

namespace suburban.essentials.HelperServices;

public interface IFileService
{
    public Task<T?> LoadFromFile<T>(FileInfo fileInfo, JsonSerializerOptions? options = null) where T : class;
    public Task SaveToFile(object data, FileInfo fileInfo);
}