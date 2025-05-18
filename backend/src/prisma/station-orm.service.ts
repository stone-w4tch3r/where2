import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Station } from "./models";

@Injectable()
export class StationOrmService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<Station | null> {
    return this.prisma.station.findUnique({ where: { id } });
  }

  async findMany(): Promise<Station[]> {
    return this.prisma.station.findMany();
  }

  async findByName(name: string): Promise<Station[]> {
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
    radiusKm: number,
  ): Promise<Station[]> {
    const lat = Number(latitude);
    const lon = Number(longitude);
    const radius = Number(radiusKm);
    const radiusDegrees = radius / 111.32;
    return this.prisma.station.findMany({
      where: {
        latitude: {
          gte: lat - radiusDegrees,
          lte: lat + radiusDegrees,
        },
        longitude: {
          gte: lon - radiusDegrees,
          lte: lon + radiusDegrees,
        },
      },
    });
  }

  /**
   * Bulk upsert stations efficiently.
   * - Only updates if content changed (smart JSON compare)
   * - Uses createMany for new stations
   * - Batches updates for changed stations
   * - Returns all upserted stations
   */
  async upsertStations(stations: Array<Station>): Promise<Station[]> {
    if (stations.length === 0) return [];

    // Fetch all existing stations in one query
    const ids = stations.map((s) => s.id);
    const existingStations = await this.prisma.station.findMany({
      where: { id: { in: ids } },
    });
    const existingMap = new Map(existingStations.map((s) => [s.id, s]));

    // Helper for normalization
    const normalize = (s: {
      fullName: string;
      transportMode: string;
      latitude: number | null;
      longitude: number | null;
      country: string | null;
      region: string | null;
    }) => ({
      fullName: s.fullName,
      transportMode: s.transportMode,
      latitude: s.latitude,
      longitude: s.longitude,
      country: s.country,
      region: s.region,
    });

    const toCreate: Array<{
      id: string;
      fullName: string;
      transportMode: string;
      latitude: number | null;
      longitude: number | null;
      country: string | null;
      region: string | null;
    }> = [];
    const toUpdate: Array<{
      id: string;
      data: {
        fullName: string;
        transportMode: string;
        latitude: number | null;
        longitude: number | null;
        country: string | null;
        region: string | null;
      };
    }> = [];

    for (const station of stations) {
      const existing = existingMap.get(station.id);
      const newData = normalize(station);
      const existingData = existing ? normalize(existing) : null;
      if (!existingData) {
        toCreate.push({ id: station.id, ...newData });
      } else if (JSON.stringify(existingData) !== JSON.stringify(newData)) {
        toUpdate.push({ id: station.id, data: newData });
      }
      // else: no change, skip
    }

    // Bulk create new stations
    if (toCreate.length > 0) {
      await this.prisma.station.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    // Batch updates for changed stations (Prisma does not support updateMany with different data, so we do them in parallel, batching for efficiency)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
      const batch = toUpdate.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((u) =>
          this.prisma.station.update({ where: { id: u.id }, data: u.data }),
        ),
      );
    }

    // Return all upserted stations
    return this.prisma.station.findMany({ where: { id: { in: ids } } });
  }
}
