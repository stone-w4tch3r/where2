// See https://aka.ms/new-console-template for more information

using Arbus.Network;
using Arbus.Network.Implementations;
using suburban.essentials.HelperServices;
using YandexService.Core.Fetching;
using YandexService.Core.Fetching.DTOs;
using YandexService.Core.Fetching.Endpoints;

Console.WriteLine("Hello, World!");

var fetcher = new Fetcher<StationScheduleEndpoint, StationScheduleDto>(
    new HttpClientContext(new NativeHttpClient(new WindowsNetworkManager())),
    new FileService());
var result = await fetcher.Fetch(() => new(new("s9607404", null)));

Console.WriteLine(result?.ToString() ?? "nope");