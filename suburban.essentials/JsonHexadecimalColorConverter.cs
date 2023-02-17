using System.Drawing;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace suburban.essentials;

public class JsonHexadecimalColorConverter : JsonConverter<Color>
{
    public override Color Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var colorString = reader.GetString();
        return ColorTranslator.FromHtml(colorString ?? "");
    }

    public override void Write(Utf8JsonWriter writer, Color value, JsonSerializerOptions options)
    {
        var colorString = ColorTranslator.ToHtml(value);
        writer.WriteStringValue(colorString);
    }
}