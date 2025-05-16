import { Logger } from "@nestjs/common";
import { Result, ResultUtils } from "./Result";

export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  protected async executeWithResult<T>(
    operation: () => Promise<T> | T,
    errorMessage = "Operation failed"
  ): Promise<Result<T>> {
    try {
      const result = await operation();
      return ResultUtils.success(result);
    } catch (error: unknown) {
      const err = error as Error & { code?: string };
      this.logger.error(`${errorMessage}: ${err.message}`, err.stack);
      return ResultUtils.error(
        errorMessage,
        err.code || "INTERNAL_ERROR",
        process.env.NODE_ENV === "development" ? err : undefined
      );
    }
  }

  protected handleNotFound<T>(
    data: T | null | undefined,
    entityName: string,
    identifier?: string
  ): Result<T> {
    if (!data) {
      const idString = identifier ? ` with id ${identifier}` : "";
      return ResultUtils.error(
        `${entityName}${idString} not found`,
        "NOT_FOUND"
      );
    }
    return ResultUtils.success(data);
  }
}
