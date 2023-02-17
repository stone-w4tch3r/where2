using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record Carrier : IDataType
{
    public required int YandexCode { get; init; }

    public required string Title { get; init; }
}