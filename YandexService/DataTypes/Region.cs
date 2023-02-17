using YandexService.DataTypes.Abstractions;

namespace YandexService.DataTypes;

public record Region(string Title, Codes Codes, IEnumerable<Settlement> Settlements) : IDataType;