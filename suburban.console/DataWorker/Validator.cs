using suburban.console.DataWorker.DTOs;
using suburban.console.Records;
using suburban.essentials;

namespace suburban.console.DataWorker;

public class DtoValidator : IDtoValidator
{
    public StationsRoot Validate(StationsRootDto dto) =>
        (dto.Countries ?? throw new NullReferenceException(nameof(dto.Countries)))
        .First(countryDto => countryDto.Title == "Россия")
        .Map(countryDto => new StationsRoot(Convert(countryDto)));

    private static Country Convert(CountryDto dto) =>
        new(
            dto.Title ?? throw new NullReferenceException(dto.Title),
            Convert(dto.Codes ?? throw new NullReferenceException(nameof(dto.Codes))),
            (dto.Regions ?? throw new NullReferenceException(nameof(dto.Regions))).Select(Convert));

    private static Region Convert(RegionDto dto) =>
        new(
            dto.Title ?? throw new NullReferenceException(nameof(RegionDto.Title)),
            Convert(dto.Codes ?? throw new NullReferenceException(nameof(dto.Codes))),
            (dto.Settlements ?? throw new NullReferenceException(nameof(dto.Settlements))).Select(Convert));

    private static Settlement Convert(SettlementDto dto) =>
        new(
            dto.Title ?? throw new NullReferenceException(nameof(SettlementDto.Title)),
            Convert(dto.Codes ?? throw new NullReferenceException(nameof(dto.Codes))),
            (dto.Stations ?? throw new NullReferenceException(nameof(dto.Stations))).Select(Convert));

    private static Station Convert(StationDto dto) =>
        new(
            dto.Title ?? throw new NullReferenceException(nameof(StationDto.Title)),
            Convert(dto.Codes ?? throw new NullReferenceException(nameof(dto.Codes))),
            dto.Direction ?? throw new NullReferenceException(nameof(StationDto.Direction)),
            dto.StationType ?? throw new NullReferenceException(nameof(StationDto.StationType)), 
            dto.Longitude ?? throw new NullReferenceException(nameof(StationDto.Longitude)),
            dto.TransportType ?? throw new NullReferenceException(nameof(StationDto.TransportType)), 
            dto.Latitude ?? throw new NullReferenceException(nameof(StationDto.Latitude)));

    private static Codes Convert(CodesDto dto) =>
        new(
            dto.YandexCode ?? throw new NullReferenceException(nameof(CodesDto.YandexCode)),
            dto.EsrCode);
}