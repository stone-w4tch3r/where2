using Arbus.Network.Abstractions;
using suburban.console.HelperServices;

namespace suburban.console.Extensions;

public static class ArbusNetworkExtensions
{
    public static async Task<T> RunEndpointWithLogging<T>(
        this IHttpClientContext context,
        ApiEndpoint<T> endpoint,
        FileInfo fileInfo,
        IFileService fileService
    ) where T : notnull =>
        await context.RunEndpoint(endpoint).ConfigureAwait(false)
            .TapLogToFile(fileInfo, fileService);
}