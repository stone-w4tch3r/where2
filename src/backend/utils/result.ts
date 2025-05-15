export type Success<T> = {
  success: true;
  data: T;
};

export type Failure<E = string> = {
  success: false;
  error: E;
};

export type Result<T, E = string> = Success<T> | Failure<E>;

export function createSuccess<T>(data: T): Success<T> {
  return {
    success: true,
    data,
  };
}

export function createFailure<E = string>(error: E): Failure<E> {
  return {
    success: false,
    error,
  };
}
