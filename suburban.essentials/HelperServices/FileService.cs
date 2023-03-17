using System.Text.Encodings.Web;
using System.Text.Json;
using suburban.essentials.Exceptions;

namespace suburban.essentials.HelperServices;

public class FileService : IFileService
{
    public async Task<T?> LoadFromFile<T>(FileInfo fileInfo) where T : class
    {
        if (!fileInfo.Exists)
            return null;

        try
        {
            return await LoadFromFileUnsafe<T>(fileInfo).ConfigureAwait(false);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error while loading from file: {e.GetType()} {e.Message},\n{e.StackTrace}");
            return null;
        }
    }

    public async Task SaveToFile(object data, FileInfo fileInfo)
    {
        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
        fileInfo.Directory?.Create();
        fileInfo.Delete();
        await using var stream = File.OpenWrite(fileInfo.FullName);
        await JsonSerializer.SerializeAsync(stream, data, options).ConfigureAwait(false);
    }
    
    private static async Task<T> LoadFromFileUnsafe<T>(FileSystemInfo file)
    {
        await using var stream = File.OpenRead(file.FullName);
        return await JsonSerializer.DeserializeAsync<T>(stream).ConfigureAwait(false)
               ?? throw new NRE($"{file.FullName} deserialize failed");
    }
}