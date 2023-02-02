using suburban.console.DataTypes.Abstractions;
using suburban.console.YandexDataService.Fetchers.DtoConverters.Transits.TransitTypes;

namespace suburban.console.YandexDataService.Fetchers.DtoConverters.Transits;

public interface IOutTransitConverter<in TTransitType, out TDataType> 
    where TTransitType : ITransitType 
    where TDataType : IDataType
{
    public TDataType ConvertTransitTypeToDataType(TTransitType dto);
}

public interface IOutTransitConverter<in TTransitType1, in TTransitType2, out TDataType> 
    where TTransitType1 : ITransitType 
    where TTransitType2 : ITransitType 
    where TDataType : IDataType
{
    public TDataType ConvertTransitTypeToDataType(TTransitType1 dto1, TTransitType2 dto2);
}