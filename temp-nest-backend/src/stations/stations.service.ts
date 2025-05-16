import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { BaseService } from "../utils/base.service.js";
import { Result, ResultUtils } from "../utils/result.js";
import { Prisma, Station } from "@prisma/client";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";

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

  async create(data: CreateStationDto): Promise<Result<Station>> {
    try {
      const station = await this.prisma.station.create({
        data,
      });
      return ResultUtils.success(station);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return ResultUtils.error(
            "A station with this identifier already exists",
            "CONFLICT"
          );
        }
      }
      this.logger.error(
        `Failed to create station: ${error.message}`,
        error.stack
      );
      return ResultUtils.error("Failed to create station", "INTERNAL_ERROR");
    }
  }

  async update(id: string, data: UpdateStationDto): Promise<Result<Station>> {
    try {
      // First check if the station exists
      const existingStation = await this.prisma.station.findUnique({
        where: { id },
      });

      if (!existingStation) {
        return ResultUtils.error(
          `Station with id ${id} not found`,
          "NOT_FOUND"
        );
      }

      const updatedStation = await this.prisma.station.update({
        where: { id },
        data,
      });

      return ResultUtils.success(updatedStation);
    } catch (error) {
      this.logger.error(
        `Failed to update station: ${error.message}`,
        error.stack
      );
      return ResultUtils.error("Failed to update station", "INTERNAL_ERROR");
    }
  }

  async remove(id: string): Promise<Result<Station>> {
    try {
      // First check if the station exists
      const existingStation = await this.prisma.station.findUnique({
        where: { id },
      });

      if (!existingStation) {
        return ResultUtils.error(
          `Station with id ${id} not found`,
          "NOT_FOUND"
        );
      }

      const deletedStation = await this.prisma.station.delete({
        where: { id },
      });

      return ResultUtils.success(deletedStation);
    } catch (error) {
      this.logger.error(
        `Failed to delete station: ${error.message}`,
        error.stack
      );
      return ResultUtils.error("Failed to delete station", "INTERNAL_ERROR");
    }
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
