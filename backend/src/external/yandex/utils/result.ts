export type Success<T> = {
  success: true
  data: T
}

export type Failure = {
  success: false
  message: string
}

export type Result<T> = Success<T> | Failure

export function createSuccess<T>(data: T): Success<T> {
  return {
    success: true,
    data,
  }
}

export function createFailure(message: string): Failure {
  return {
    success: false,
    message,
  }
}
