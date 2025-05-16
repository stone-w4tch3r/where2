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
          // No error code, always use INTERNAL_SERVER_ERROR
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
      }),
    );
  }
}
