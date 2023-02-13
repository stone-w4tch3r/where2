using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Filters;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;
using suburban.console.YandexDataService.Fetchers.DTOs.StationsEndpoint;
using suburban.essentials;
using Settlement = suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes.Settlement;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits;

public class StationsInTransitConverter : IInTransitConverter<StationsDto, StationsTransitType>
{
    private readonly IDataFilter<StationsTransitType> _stationsFilter;
    
    public StationsInTransitConverter(IDataFilter<StationsTransitType> stationsFilter)
    {
        _stationsFilter = stationsFilter;
    }
    
    public StationsTransitType ConvertDtoToTransitType(StationsDto dto) =>
        (dto.Countries ?? throw new NullReferenceException(nameof(dto.Countries)))
        .First(countryDto => countryDto.Title == "Россия")
        .Map(countryDto => new StationsTransitType() { Country = Convert(countryDto) })
        .Map(_stationsFilter.Filter);

    private static Country Convert(CountryDto dto) =>
        new(
            dto.Title ?? throw new NullReferenceException(dto.Title),
            Convert(dto.Codes ?? throw new NullReferenceException(nameof(dto.Codes))),
            (dto.Regions ?? throw new NullReferenceException(nameof(dto.Regions))).Select(Convert));

    private static Region Convert(RegionDto dto) =>
        new(
            dto.Title ?? throw new NullReferenceException(nameof(RegionDto.Title)),
            Convert(dto.Codes ?? throw new NullReferenceException(nameof(dto.Codes))),
            (dto.Settlements ?? throw new NullReferenceException(nameof(dto.Settlements))).Select(Convert));

    private static Settlement Convert(SettlementDto dto) =>
        new(
            dto.Title ?? throw new NullReferenceException(nameof(SettlementDto.Title)),
            Convert(dto.Codes ?? throw new NullReferenceException(nameof(dto.Codes))),
            (dto.Stations ?? throw new NullReferenceException(nameof(dto.Stations))).Select(Convert));

    private static StationsTransitType.Station Convert(StationsDto.StationDto dto) =>
        new ()
        {
            Title = dto.Title ?? throw new NullReferenceException(nameof(StationsDto.StationDto.Title)),
            Codes = Convert(dto.Codes ?? throw new NullReferenceException(nameof(dto.Codes))),
            Direction = dto.Direction,
            StationType = ConvertStationType(dto.StationType),
            Longitude = dto.Longitude,
            TransportType = ConvertTransportType(dto.TransportType),
            Latitude = dto.Latitude
        };

    private static Codes Convert(CodesDto dto) =>
        new(
            dto.YandexCode,
            dto.EsrCode);

    private static StationType ConvertStationType(string? stationType) =>
        stationType switch
        {
            "station" => StationType.Station,
            "platform" => StationType.Platform,
            "stop" => StationType.Stop,
            "checkpoint" => StationType.Checkpoint,
            "post" => StationType.Post,
            "crossing" => StationType.Crossing,
            "overtaking_point" => StationType.OvertakingPoint,
            "train_station" => StationType.TrainStation,
            "airport" => StationType.Airport,
            "bus_station" => StationType.BusStation,
            "bus_stop" => StationType.BusStop,
            "unknown" => StationType.Unknown,
            "port" => StationType.Port,
            "port_point" => StationType.PortPoint,
            "wharf" => StationType.Wharf,
            "river_port" => StationType.RiverPort,
            "marine_station" => StationType.MarineStation, 
            "" => StationType.NullOrEmpty,
            null => StationType.NullOrEmpty,
            _ => throw new ArgumentOutOfRangeException($"<{stationType}>")
        };
    
    private static TransportType ConvertTransportType(string? transportType) =>
        transportType switch
        {
            "plane" => TransportType.Plane,
            "train" => TransportType.Train,
            "suburban" => TransportType.Suburban,
            "bus" => TransportType.Bus,
            "water" => TransportType.Water,
            "helicopter" => TransportType.Helicopter,
            "sea" => TransportType.Sea,
            "" => TransportType.NullOrEmpty,
            null => TransportType.NullOrEmpty,
            _ => throw new ArgumentOutOfRangeException($"<{transportType}>")
        };
}