using System.Drawing;
using System.Text.Json.Serialization;
using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public partial record TransportSubtype : IModel
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public required SubtypeCode Code { get; init; }

    public required string Title { get; init; }

    public required Color Color { get; init; }
}