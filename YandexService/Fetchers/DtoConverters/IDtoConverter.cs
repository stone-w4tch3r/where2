using YandexService.DataTypes.Abstractions;
using YandexService.Fetchers.DTOs;

namespace YandexService.Fetchers.DtoConverters;

public interface IDtoConverter<in TDto, out TDataType> 
    where TDto : IDto where TDataType : IDataType
{
    public TDataType ConvertDtoToDataType(TDto dto);
}