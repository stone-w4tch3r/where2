using System.Diagnostics.CodeAnalysis;

namespace suburban.essentials;

public readonly record struct Result<T>
{
    [MemberNotNullWhen(true, nameof(Value))]
    public bool IsSuccess { get; }

    public T? Value { get; }

    public Result(bool isSuccess, T? value)
    {
        IsSuccess = isSuccess;
        Value = value is null && isSuccess
            ? throw new ArgumentNullException(nameof(value))
            : value;
    }
}