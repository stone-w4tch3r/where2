using YandexService.Infrastructure.DI;

Console.WriteLine("Hello, World!");

var stations = await new Container().StationsProvider().ConfigureAwait(false);
Console.WriteLine(stations);