import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

function isResultSuccess<T, E>(
  data: unknown,
): data is { success: true; data: T } {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as { success: boolean }).success === true &&
    "data" in data
  );
}

@Injectable()
export class ResultUnwrapInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === "object" && "success" in data) {
          // Only unwrap if it's a Result
          if (isResultSuccess(data)) {
            return data.data;
          }
          return data; // Let error mapping interceptor handle errors
        }
        return data;
      }),
    );
  }
}
