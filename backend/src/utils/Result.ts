export * from "./Result";

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

export function resultSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

export function resultError<E = string>(error: E): Result<never, E> {
  return { success: false, error };
}
