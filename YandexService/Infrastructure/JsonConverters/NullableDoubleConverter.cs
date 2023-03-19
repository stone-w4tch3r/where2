using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace YandexService.Infrastructure.JsonConverters;

internal class NullableDoubleConverter : JsonConverter<double?>
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