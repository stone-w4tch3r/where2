// See https://aka.ms/new-console-template for more information

// using Arbus.Network;
// using Arbus.Network.Implementations;
// using suburban.essentials.HelperServices;
// using YandexService.Core.Fetching;
// using YandexService.Core.Fetching.DTOs;
// using YandexService.Core.Fetching.Endpoints;

using YandexService.Infrastructure.DI;

Console.WriteLine("Hello, World!");

var container = new Container();
var getStations = container.StationsProvider;
var stations = await getStations().ConfigureAwait(false);
Console.WriteLine(stations);