using suburban.console.DataTypes;
using suburban.console.YandexDataService.DTOs;

namespace suburban.console.YandexDataService.DtoConverters;

public interface IDtoConverter<in TDto, out TDataType> 
    where TDto : IDto where TDataType : IDataType
{
    public TDataType ConvertDtoToDataType(TDto dto);
}