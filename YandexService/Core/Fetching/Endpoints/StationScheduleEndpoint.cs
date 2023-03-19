using YandexService.API.DataTypes;
using YandexService.Core.Fetching.DTOs;

namespace YandexService.Core.Fetching.Endpoints;

internal class StationScheduleEndpoint : EndpointBase<Codes, ScheduleDto>
{
    private const int Limit = 999;
    private const string TimeZone = "Europe/Moscow";
    private const string TransportTypes = "suburban";


    //https://api.rasp.yandex.net/v3.0/schedule/?apikey=741883ec-2d53-4830-aa83-fa17b38c1f66&station=s9607404&transport_types=suburban&limit=999999&result_timezone=europe/moscow
    protected override string RootPath => "https://api.rasp.yandex.net/v3.0/schedule";

    public override HttpMethod Method => HttpMethod.Get;

    protected override IEnumerable<string> PathParts => new[]
    {
        $"station={Parameter.YandexCode}",
        $"transport_types={TransportTypes}",
        $"result_timezone={TimeZone}",
        $"limit={Limit}"
    };

    public StationScheduleEndpoint(Codes codes) : base(codes)
    {
    }
}