using YandexService.API.DataTypes;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

public class CodesConverter : IDtoConverter<CodesDto, Codes>
{
    public Codes ConvertToDataType(CodesDto dto) =>
        new(
            dto.YandexCode,
            dto.EsrCode);
}