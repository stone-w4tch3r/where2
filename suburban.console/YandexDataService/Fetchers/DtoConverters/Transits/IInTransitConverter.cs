using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;
using suburban.console.YandexDataService.Fetchers.DTOs;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits;

public interface IInTransitConverter<in TDto, out TTransitType> 
    where TDto : IDto 
    where TTransitType : ITransitType
{
    public TTransitType ConvertDtoToTransitType(TDto dto);
}

public interface IInTransitConverter<in TDto1, in TDto2, out TTransitType> 
    where TDto1 : IDto 
    where TDto2 : IDto 
    where TTransitType : ITransitType
{
    public TTransitType ConvertDtoToTransitType(TDto1 dto1, TDto2 dto2);
}