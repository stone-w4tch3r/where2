namespace YandexService.Core.Fetchers.DtoConverters;

internal interface IStringToEnumConverter<out TEnum> where TEnum : Enum
{
    public TEnum ConvertToEnum(string? dto);
}