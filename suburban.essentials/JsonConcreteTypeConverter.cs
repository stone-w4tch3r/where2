using System.Text.Json;
using System.Text.Json.Serialization;

namespace suburban.essentials;

public class JsonConcreteTypeConverter<TConcrete> : JsonConverter<TConcrete>
{
    public override bool CanConvert(Type typeToConvert) =>
        typeToConvert.IsInterface && typeof(TConcrete).GetInterfaces().Contains(typeToConvert);

    public override TConcrete? Read(ref Utf8JsonReader reader, Type _, JsonSerializerOptions options)
    {
        using var jsonDoc = JsonDocument.ParseValue(ref reader);
        return JsonSerializer.Deserialize<TConcrete>(jsonDoc.RootElement.GetRawText(), options);
    }

    public override void Write(Utf8JsonWriter writer, TConcrete? value, JsonSerializerOptions options) =>
        JsonSerializer.Serialize(writer, value, options);
}