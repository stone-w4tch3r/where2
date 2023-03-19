using System.Text.Json.Serialization;
using YandexService.API.DataTypes.Abstractions;
using YandexService.API.DataTypes.Enums;

namespace YandexService.API.DataTypes;

public record RouteThread : IModel
{
    public required UId Id { get; init; }

    public required string Number { get; init; }

    public required string Title { get; init; }

    public required bool IsExpress { get; init; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public required TransportType TransportType { get; init; }
    
    public required TransportSubtype TransportSubtype { get; init; }
}