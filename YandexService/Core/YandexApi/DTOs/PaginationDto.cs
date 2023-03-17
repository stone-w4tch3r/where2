namespace YandexService.Core.YandexApi.DTOs;

internal record PaginationDto : IDto
{
    public int? Total { get; init; }

    public int? Limit { get; init; }

    public int? Offset { get; init; }
}