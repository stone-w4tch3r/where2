using YandexService.API.DataTypes.Abstractions;

namespace YandexService.API.DataTypes;

public record Region(string Title, Codes Codes, IEnumerable<Settlement> Settlements) : IDataType;