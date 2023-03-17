using YandexService.API.DataTypes.Enums;

namespace YandexService.Core.Mapping.Converters;

internal class TransportTypeConverter
{
    public static TransportType ConvertToEnum(string? transportType) =>
        transportType switch
        {
            "plane" => TransportType.Plane,
            "train" => TransportType.Train,
            "suburban" => TransportType.Suburban,
            "bus" => TransportType.Bus,
            "water" => TransportType.Water,
            "helicopter" => TransportType.Helicopter,
            "sea" => TransportType.Sea,
            "" => TransportType.NullOrEmpty,
            null => TransportType.NullOrEmpty,
            _ => throw new ArgumentOutOfRangeException($"<{transportType}>")
        };
}