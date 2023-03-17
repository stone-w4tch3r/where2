using System.Diagnostics.CodeAnalysis;
using Arbus.Network;
using Arbus.Network.Abstractions;
using Arbus.Network.Implementations;
using suburban.essentials.HelperServices;
using YandexService.Core.Cache;

namespace YandexService.Infrastructure.DI;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Local")]
internal partial class Container
{
    private class Services
    {
        public IFileService FileService { get; }

        public IHttpClientContext Context { get; }

        public Uncacher Uncacher { get; }

        public Cacher Cacher { get; }

        public Services()
        {
            FileService = new FileService();
            Context = new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager()));
            Uncacher = new(FileService);
            Cacher = new(FileService);
        }
    }
}