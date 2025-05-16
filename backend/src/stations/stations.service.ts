import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { BaseService } from "../utils/base.service.js";
import { Result } from "../utils/Result.js";
import { Station } from "@prisma/client";

@Injectable()
export class StationsService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(StationsService.name);
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
