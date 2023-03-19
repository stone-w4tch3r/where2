using YandexService.Infrastructure.DI;

Console.WriteLine("Hello, World!");

// var stations = await new Container().StationsProvider().ConfigureAwait(false);
// Console.WriteLine(stations);

var schedule = await new Container().StationScheduleProvider(new ("s9607404")).ConfigureAwait(false);
Console.WriteLine(schedule);