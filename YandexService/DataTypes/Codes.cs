using YandexService.DataTypes.Abstractions;

namespace YandexService.DataTypes;

public record Codes(string? YandexCode, string? EsrCode) : IDataType;