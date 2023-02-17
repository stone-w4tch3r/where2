namespace YandexService.Core.Fetchers.DTOs;

public record PaginationDto : IDto
{
    public required int? Total { get; init; }
    public required int? Limit { get; init; }
    public required int? Offset { get; init; }
}