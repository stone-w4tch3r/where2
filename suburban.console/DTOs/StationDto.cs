using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace suburban.console.DTOs;

public record StationDto(
    string? Direction,
    CodesDto? Codes,
    string? StationType,
    string? Title,
    [property: JsonConverter(typeof(MyConverter))]
    double? Longitude,
    string? TransportType,
    [property: JsonConverter(typeof(MyConverter))]
    double? Latitude);

public class MyConverter : JsonConverter<double?>
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
        throw new NotImplementedException();
}