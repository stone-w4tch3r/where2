using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace suburban.console.YandexDataService.DTOs;

public record StationDto(
    string? Direction,
    CodesDto? Codes,
    [property: JsonPropertyName("station_type")]
    string? StationType,
    string? Title,
    [property: JsonConverter(typeof(NullableDoubleConverter))]
    double? Longitude,
    [property: JsonPropertyName("transport_type")]
    string? TransportType,
    [property: JsonConverter(typeof(NullableDoubleConverter))]
    double? Latitude);

public class NullableDoubleConverter : JsonConverter<double?>
{
    public override double? Read(ref Utf8JsonReader reader, Type _, JsonSerializerOptions __)
    {
        using var jsonDoc = JsonDocument.ParseValue(ref reader);
        return
            double.TryParse(
                jsonDoc.RootElement.GetRawText(),
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out var result)
                ? result
                : null;
    }

    public override void Write(Utf8JsonWriter writer, double? value, JsonSerializerOptions options) =>
        JsonSerializer.Serialize(writer, value, options);
}