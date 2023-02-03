using suburban.console.DataTypes.Abstractions;
using suburban.console.YandexDataService.Fetchers.DTOs;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters;

public interface IDtoConverter<in TDto, out TDataType> 
    where TDto : IDto 
    where TDataType : IDataType
{
    public TDataType ConvertDtoToDataType(TDto dto);
}

public interface IDtoConverter<in TDto1, in TDto2, out TDataType> 
    where TDto1 : IDto 
    where TDto2 : IDto 
    where TDataType : IDataType
{
    public TDataType ConvertDtoToDataType(TDto1 dto1, TDto2 dto2);
}