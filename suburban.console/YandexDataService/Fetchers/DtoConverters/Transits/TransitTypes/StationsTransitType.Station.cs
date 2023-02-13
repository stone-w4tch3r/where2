using System.Text.Json.Serialization;
using suburban.console.DataTypes;
using suburban.console.DataTypes.Enums;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

// ReSharper disable UnusedAutoPropertyAccessor.Global - json deserialization todo delete json
public partial record StationsTransitType
{
    public record Station : ITransitType
    {
        public required string Title { get; init; }

        public required Codes Codes { get; init; }

        public required string? Direction { get; init; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public required StationType StationType { get; init; }

        public required double? Longitude { get; init; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public required TransportType TransportType { get; init; }

        public required double? Latitude { get; init; }
    }
}