using YandexService.API.DataTypes.Abstractions;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

public interface IDtoConverter<in TDto, out TDataType>
    where TDto : IDto where TDataType : IDataType
{
    public TDataType ConvertDtoToDataType(TDto dto);
}