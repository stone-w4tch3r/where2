import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Station } from "./models";
import { Prisma } from "@prisma/client";
import { TransportMode } from "../shared/dto/transport-mode.dto";
import { StationFilterDto } from "../stations/dto/station-filter.dto";

@Injectable()
export class StationOrmService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<Station | null> {
    const s = await this.prisma.station.findUnique({ where: { id } });
    if (!s) return null;
    return { ...s, transportMode: s.transportMode as TransportMode };
  }

  async findMany(filter?: StationFilterDto): Promise<Station[]> {
    const where: Prisma.StationWhereInput = {};
    if (filter) {
      if (filter.country) where.country = filter.country;
      if (filter.region) where.region = filter.region;
      if (filter.transportMode) where.transportMode = filter.transportMode;
      if (
        filter.minLat !== undefined ||
        filter.maxLat !== undefined ||
        filter.minLon !== undefined ||
        filter.maxLon !== undefined
      ) {
        where.AND = [];
        if (filter.minLat !== undefined)
          where.AND.push({ latitude: { gte: filter.minLat } });
        if (filter.maxLat !== undefined)
          where.AND.push({ latitude: { lte: filter.maxLat } });
        if (filter.minLon !== undefined)
          where.AND.push({ longitude: { gte: filter.minLon } });
        if (filter.maxLon !== undefined)
          where.AND.push({ longitude: { lte: filter.maxLon } });
      }
    }
    const stations = await this.prisma.station.findMany({ where });
    return stations.map((s) => ({
      ...s,
      transportMode: s.transportMode as TransportMode,
    }));
  }

  async findByName(name: string): Promise<Station[]> {
    const stations = await this.prisma.station.findMany({
      where: {
        fullName: { contains: name, mode: "insensitive" },
      },
    });
    return stations.map((s) => ({
      ...s,
      transportMode: s.transportMode as TransportMode,
    }));
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
    const stations = await this.prisma.station.findMany({
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
    return stations.map((s) => ({
      ...s,
      transportMode: s.transportMode as TransportMode,
    }));
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
      // Ensure transportMode is a string for DB comparison, but cast to TransportMode for Station type
      const newData = normalize({
        ...station,
        transportMode: station.transportMode as string,
      });
      const existingData = existing
        ? normalize({
            ...existing,
            transportMode: existing.transportMode as string,
          })
        : null;
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
    const upserted = await this.prisma.station.findMany({
      where: { id: { in: ids } },
    });
    return upserted.map((s) => ({
      ...s,
      transportMode: s.transportMode as TransportMode,
    }));
  }
}
