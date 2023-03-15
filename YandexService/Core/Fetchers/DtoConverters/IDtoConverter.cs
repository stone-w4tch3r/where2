using YandexService.API.DataTypes.Abstractions;
using YandexService.Core.Fetchers.DTOs;

namespace YandexService.Core.Fetchers.DtoConverters;

internal interface IDtoConverter<in TDto, out TDataType>
    where TDto : IDto where TDataType : IDataType
{
    public TDataType ConvertToDataType(TDto dto);
}