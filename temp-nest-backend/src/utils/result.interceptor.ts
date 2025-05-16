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
import { Result } from "./result";

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If the data is not a Result object, return it as is
        if (!data || typeof data !== "object" || !("success" in data)) {
          return data;
        }

        const result = data as Result<any>;

        if (result.success) {
          return result.data;
        } else {
          // Map common error codes to HTTP status codes
          let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

          switch (result.error.code) {
            case "NOT_FOUND":
              statusCode = HttpStatus.NOT_FOUND;
              break;
            case "INVALID_INPUT":
            case "VALIDATION_ERROR":
              statusCode = HttpStatus.BAD_REQUEST;
              break;
            case "UNAUTHORIZED":
              statusCode = HttpStatus.UNAUTHORIZED;
              break;
            case "FORBIDDEN":
              statusCode = HttpStatus.FORBIDDEN;
              break;
            case "CONFLICT":
              statusCode = HttpStatus.CONFLICT;
              break;
          }

          throw new HttpException(
            {
              message: result.error.message,
              code: result.error.code,
              details: result.error.details,
            },
            statusCode
          );
        }
      })
    );
  }
}
