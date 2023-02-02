using System.Text.Json.Serialization;
using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

public record Station_StationsEndpoint_TransitType(
    string Title,
    Codes Codes,
    string? Direction,
    [property: JsonConverter(typeof(JsonStringEnumConverter))] //todo remove??
    StationType StationType,
    double? Longitude,
    [property: JsonConverter(typeof(JsonStringEnumConverter))] //todo remove??
    TransportType TransportType,
    double? Latitude) : ITransitType;