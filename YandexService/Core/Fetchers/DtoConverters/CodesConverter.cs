using YandexService.API.DataTypes;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

internal class CodesConverter
{
    public Codes ConvertToDataType(CodesDto dto) =>
        new(
            dto.YandexCode,
            dto.EsrCode);
}