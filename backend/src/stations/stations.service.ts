import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Result, ResultUtils } from "../utils/Result.js";
import { Station } from "@prisma/client";

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async executeWithResult<T>(
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

  private handleNotFound<T>(
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

  async findAll(): Promise<Result<Station[]>> {
    return this.executeWithResult(
      () => this.prisma.station.findMany(),
      "Failed to fetch stations"
    );
  }

  async findOne(id: string): Promise<Result<Station>> {
    const station = await this.prisma.station.findUnique({
      where: { id },
    });

    return this.handleNotFound(station, "Station", id);
  }

  async findByName(name: string): Promise<Result<Station[]>> {
    return this.executeWithResult(async () => {
      return this.prisma.station.findMany({
        where: {
          OR: [
            { fullName: { contains: name, mode: "insensitive" } },
            { popularName: { contains: name, mode: "insensitive" } },
            { shortName: { contains: name, mode: "insensitive" } },
          ],
        },
      });
    }, `Failed to find stations by name: ${name}`);
  }

  async findByCoordinates(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<Result<Station[]>> {
    return this.executeWithResult(async () => {
      // Approximate conversion from km to degrees
      const radiusDegrees = radiusKm / 111.32;

      return this.prisma.station.findMany({
        where: {
          latitude: {
            gte: latitude - radiusDegrees,
            lte: latitude + radiusDegrees,
          },
          longitude: {
            gte: longitude - radiusDegrees,
            lte: longitude + radiusDegrees,
          },
        },
      });
    }, "Failed to find stations by coordinates");
  }
}
