using Arbus.Network.Abstractions;
using suburban.essentials.Extensions;
using suburban.essentials.HelperServices;

namespace YandexService.Extensions;

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