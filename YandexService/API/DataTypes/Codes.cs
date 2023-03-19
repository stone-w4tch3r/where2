using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record Codes(string? YandexCode) : IModel;