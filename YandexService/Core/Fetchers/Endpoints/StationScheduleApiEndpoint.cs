using YandexService.API.DataTypes;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.Endpoints;

public class StationScheduleApiEndpoint : ApiEndpointBase<StationScheduleDto>
{
    private const string TimeZone = "Europe/Moscow";
    private const string TransportTypes = "suburban";
    private const int Limit = 999;

    private readonly Codes _stationCode;

    //https://api.rasp.yandex.net/v3.0/schedule/?apikey=741883ec-2d53-4830-aa83-fa17b38c1f66&station=s9607404&transport_types=suburban&limit=999999&result_timezone=europe/moscow
    protected override string RootPath => "https://api.rasp.yandex.net/v3.0/schedule";

    public override HttpMethod Method => HttpMethod.Get;

    protected override IEnumerable<string> PathParts => new[]
    {
        $"station={_stationCode.YandexCode}",
        $"transport_types={TransportTypes}",
        $"result_timezone={TimeZone}",
        $"limit={Limit}"
    };

    public StationScheduleApiEndpoint(Codes stationCode)
    {
        _stationCode = stationCode;
    }
}