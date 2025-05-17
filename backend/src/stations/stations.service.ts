import { Injectable, Logger } from "@nestjs/common";
import { StationOrmService } from "../prisma/station-orm.service";
import { Result, resultSuccess, resultError } from "../utils/Result";
import { Station } from "@prisma/client";
import { AppError, NotFoundError, InternalError } from "../utils/errors";

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);

  constructor(private readonly stationOrm: StationOrmService) {}

  private async executeWithResult<T>(
    operation: () => Promise<T> | T,
    errorMessage = "Operation failed",
  ): Promise<Result<T, AppError>> {
    try {
      const result = await operation();
      return resultSuccess(result);
    } catch (error: unknown) {
      const err = error as Error & { code?: string };
      this.logger.error(`${errorMessage}: ${err.message}`, err.stack);
      return resultError(new InternalError(errorMessage));
    }
  }

  private handleNotFound<T>(
    data: T | null | undefined,
    entityName: string,
    identifier?: string,
  ): Result<T, AppError> {
    if (!data) {
      const idString = identifier ? ` with id ${identifier}` : "";
      return resultError(
        new NotFoundError(`${entityName}${idString} not found`),
      );
    }
    return resultSuccess(data);
  }

  async findAll(): Promise<Result<Station[], AppError>> {
    return this.executeWithResult(
      () => this.stationOrm.findMany(),
      "Failed to fetch stations",
    );
  }

  async findOne(id: string): Promise<Result<Station, AppError>> {
    const station = await this.stationOrm.findOne(id);
    return this.handleNotFound(station, "Station", id);
  }

  async findByName(name: string): Promise<Result<Station[], AppError>> {
    return this.executeWithResult(async () => {
      return this.stationOrm.findByName(name);
    }, `Failed to find stations by name: ${name}`);
  }

  async findByCoordinates(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<Result<Station[], AppError>> {
    return this.executeWithResult(async () => {
      return this.stationOrm.findByCoordinates(latitude, longitude, radiusKm);
    }, "Failed to find stations by coordinates");
  }
}
