export * from './Result';

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
}
