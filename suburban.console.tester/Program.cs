// See https://aka.ms/new-console-template for more information

using Arbus.Network;
using Arbus.Network.Implementations;
using suburban.essentials.HelperServices;
using YandexService.Core.Fetchers;
using YandexService.Core.Fetchers.DTOs;
using YandexService.Core.Fetchers.Endpoints;

Console.WriteLine("Hello, World!");

var fetcher = new DataFetcher<StationScheduleEndpoint, StationScheduleDto>(
    new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager())),
    new FileService());
var result = await fetcher.TryFetchData(() => new (new ("s9607404", null)));
if (result.IsSuccess)
    Console.WriteLine(result.Value);
else
    Console.WriteLine("nope");