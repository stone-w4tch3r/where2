using System.Diagnostics.CodeAnalysis;

namespace suburban.essentials;

public record Result<T>
{
    // ReSharper disable once ConvertToPrimaryConstructor
    public Result(bool isSuccess, T? value)
    {
        IsSuccess = isSuccess;
        Value = value;
    }
    public bool IsSuccess { get; init; }

    [MemberNotNullWhen(returnValue: true, nameof(IsSuccess))]
    public T? Value { get; }
}