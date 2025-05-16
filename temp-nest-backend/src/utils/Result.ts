export type ResultSuccess<T> = {
  success: true;
  data: T;
};

export type ResultError = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
};

export type Result<T> = ResultSuccess<T> | ResultError;

export class ResultUtils {
  static success<T>(data: T): ResultSuccess<T> {
    return {
      success: true,
      data,
    };
  }

  static error(message: string, code?: string, details?: any): ResultError {
    return {
      success: false,
      error: {
        message,
        code,
        details,
      },
    };
  }

  static unwrap<T>(result: Result<T>): T {
    if (result.success) {
      return result.data;
    }
    throw new Error(`Failed to unwrap result: ${result.error.message}`);
  }

  static isSuccess<T>(result: Result<T>): result is ResultSuccess<T> {
    return result.success;
  }

  static isError<T>(result: Result<T>): result is ResultError {
    return !result.success;
  }
}
