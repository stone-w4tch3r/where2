import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class StationOrmService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertStation(station: {
    id: string;
    fullName: string;
    transportMode: string;
    latitude: number;
    longitude: number;
    country: string;
    region: string;
  }) {
    return this.prisma.station.upsert({
      where: { id: station.id },
      update: {
        fullName: station.fullName,
        transportMode: station.transportMode,
        latitude: station.latitude,
        longitude: station.longitude,
        country: station.country,
        region: station.region,
      },
      create: {
        id: station.id,
        fullName: station.fullName,
        transportMode: station.transportMode,
        latitude: station.latitude,
        longitude: station.longitude,
        country: station.country,
        region: station.region,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.station.findUnique({ where: { id } });
  }

  async findMany() {
    return this.prisma.station.findMany();
  }

  async findByName(name: string) {
    return this.prisma.station.findMany({
      where: {
        OR: [
          { fullName: { contains: name, mode: "insensitive" } },
          { popularName: { contains: name, mode: "insensitive" } },
          { shortName: { contains: name, mode: "insensitive" } },
        ],
      },
    });
  }

  async findByCoordinates(
    latitude: number,
    longitude: number,
    radiusKm: number
  ) {
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
  }
}
