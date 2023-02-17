namespace YandexService.Core.Fetchers.DtoConverters;

public interface IStringToEnumConverter<out TEnum> where TEnum : Enum
{
    public TEnum ConvertToEnum(string? dto);
}