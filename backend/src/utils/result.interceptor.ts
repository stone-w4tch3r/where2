import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Result } from "./Result";
import {
  AppError,
  NotFoundError,
  ValidationError,
  InternalError,
} from "./errors";

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // If the data is not a Result object, return it as is
        if (!data || typeof data !== "object" || !("success" in data)) {
          return data;
        }

        const result = data as Result<unknown, unknown>;

        if (result.success) {
          return result.data;
        } else {
          // Map typed errors to HTTP status codes
          if (result.error instanceof NotFoundError) {
            throw new HttpException(
              { message: result.error.message },
              HttpStatus.NOT_FOUND,
            );
          } else if (result.error instanceof ValidationError) {
            throw new HttpException(
              { message: result.error.message },
              HttpStatus.BAD_REQUEST,
            );
          } else if (result.error instanceof InternalError) {
            throw new HttpException(
              { message: result.error.message },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          } else if (result.error instanceof AppError) {
            throw new HttpException(
              { message: result.error.message },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          } else {
            throw new HttpException(
              {
                message:
                  typeof result.error === "string"
                    ? result.error
                    : "Unknown error",
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }),
    );
  }
}
