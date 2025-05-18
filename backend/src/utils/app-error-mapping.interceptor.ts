import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import {
  AppError,
  NotFoundError,
  ValidationError,
  InternalError,
} from "./errors";
import { Result } from "./Result";

@Injectable()
export class AppErrorMappingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // If it's a Result with success: false, throw mapped error
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          (data as Result<unknown, AppError>).success === false
        ) {
          const error = (data as { success: false; error: AppError }).error;
          if (error instanceof NotFoundError) {
            throw new HttpException(
              { message: error.message },
              HttpStatus.NOT_FOUND,
            );
          } else if (error instanceof ValidationError) {
            throw new HttpException(
              { message: error.message },
              HttpStatus.BAD_REQUEST,
            );
          } else if (error instanceof InternalError) {
            throw new HttpException(
              { message: error.message },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          } else if (error instanceof AppError) {
            throw new HttpException(
              { message: error.message },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          } else {
            throw new HttpException(
              { message: typeof error === "string" ? error : "Unknown error" },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
        return data;
      }),
      catchError((err) => {
        // If the controller throws an AppError, map it
        if (err instanceof NotFoundError) {
          return throwError(
            () =>
              new HttpException({ message: err.message }, HttpStatus.NOT_FOUND),
          );
        } else if (err instanceof ValidationError) {
          return throwError(
            () =>
              new HttpException(
                { message: err.message },
                HttpStatus.BAD_REQUEST,
              ),
          );
        } else if (err instanceof InternalError) {
          return throwError(
            () =>
              new HttpException(
                { message: err.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          );
        } else if (err instanceof AppError) {
          return throwError(
            () =>
              new HttpException(
                { message: err.message },
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
