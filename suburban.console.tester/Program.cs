// See https://aka.ms/new-console-template for more information

using YandexService.Core.Fetchers;
using YandexService.Core.Fetchers.DTOs;
using YandexService.Core.Fetchers.Endpoints;

Console.WriteLine("Hello, World!");

var fetcher = new DataFetcher<StationScheduleDto, StationScheduleEndpoint>();