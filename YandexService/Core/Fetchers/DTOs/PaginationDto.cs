namespace YandexService.Core.Fetchers.DTOs;

internal record PaginationDto : IDto
{
    public required int? Total { get; init; }

    public required int? Limit { get; init; }

    public required int? Offset { get; init; }
}