using suburban.essentials;
using YandexService.API.DataTypes.Abstractions;
using YandexService.Core.Fetching.DTOs;

namespace YandexService.Core.Fetching.Mapping;

internal class Mapper
{
    public static TModel Map<TDto, TModel>(
        TDto dto,
        Func<TDto, TModel> converter,
        Func<TModel, TModel> filter)
        where TDto : IDto
        where TModel : IModel
        =>
            converter(dto).To(filter);
}