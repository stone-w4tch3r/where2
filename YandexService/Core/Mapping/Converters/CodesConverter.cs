using YandexService.API.DataTypes;
using YandexService.Core.Fetching.DTOs;

namespace YandexService.Core.Mapping.Converters;

internal class CodesConverter
{
    public static Codes Convert(CodesDto dto) =>
        new(
            dto.YandexCode,
            dto.EsrCode);
}