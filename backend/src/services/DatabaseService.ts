import { PrismaClient, Prisma } from "@prisma/client";
import {
  Station,
  StationId,
  TransportMode,
  Coordinates,
} from "../models/Station";
import { Route, RouteId } from "../models/Route";

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async init() {
    try {
      await this.prisma.$connect();
      console.log("Connected to database");
      return true;
    } catch (error) {
      console.error("Failed to connect to database:", error);
      return false;
    }
  }

  async close() {
    await this.prisma.$disconnect();
  }

  // Station methods
  async saveStation(station: Station): Promise<boolean> {
    try {
      await this.prisma.station.upsert({
        where: { id: station.id.toString() },
        update: {
          fullName: station.fullName,
          popularName: station.popularName,
          shortName: station.shortName,
          transportMode: station.mode,
          latitude: station.location.latitude,
          longitude: station.location.longitude,
          country: station.country,
          region: station.region,
        },
        create: {
          id: station.id.toString(),
          fullName: station.fullName,
          popularName: station.popularName,
          shortName: station.shortName,
          transportMode: station.mode,
          latitude: station.location.latitude,
          longitude: station.location.longitude,
          country: station.country,
          region: station.region,
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to save station:", error);
      return false;
    }
  }

  async getAllStations(): Promise<Station[]> {
    const stations = await this.prisma.station.findMany();
    return stations.map(
      (s: {
        id: string;
        fullName: string;
        popularName: string | null;
        shortName: string | null;
        transportMode: string;
        latitude: number;
        longitude: number;
        country: string | null;
        region: string | null;
      }) =>
        new Station(
          new StationId(s.id),
          s.fullName,
          s.popularName,
          s.shortName,
          s.transportMode as TransportMode,
          new Coordinates(s.latitude, s.longitude),
          s.country,
          s.region
        )
    );
  }

  async getStationById(id: string): Promise<Station | null> {
    const station = await this.prisma.station.findUnique({
      where: { id },
    });

    if (!station) return null;

    return new Station(
      new StationId(station.id),
      station.fullName,
      station.popularName,
      station.shortName,
      station.transportMode as TransportMode,
      new Coordinates(station.latitude, station.longitude),
      station.country,
      station.region
    );
  }

  // Route methods
  async saveRoute(route: Route): Promise<boolean> {
    try {
      // Start a transaction to save route and its stops
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Save the route
        await tx.route.upsert({
          where: { id: route.id.toString() },
          update: {
            shortTitle: route.number,
            fullTitle: route.title,
            transportMode: route.transportType,
            routeInfoUrl: route.routeInfoUrl,
          },
          create: {
            id: route.id.toString(),
            shortTitle: route.number,
            fullTitle: route.title,
            transportMode: route.transportType,
            routeInfoUrl: route.routeInfoUrl,
          },
        });

        // Delete existing route stops
        await tx.routeStop.deleteMany({
          where: { routeId: route.id.toString() },
        });

        // Add new route stops
        for (let i = 0; i < route.stops.length; i++) {
          await tx.routeStop.create({
            data: {
              routeId: route.id.toString(),
              stationId: route.stops[i].toString(),
              stopPosition: i,
            },
          });
        }
      });

      return true;
    } catch (error) {
      console.error("Failed to save route:", error);
      return false;
    }
  }

  async getRouteById(id: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        stops: {
          include: { station: true },
          orderBy: { stopPosition: "asc" },
        },
      },
    });

    if (!route) return null;

    const stops = route.stops.map(
      (s: { stationId: string }) => new StationId(s.stationId)
    );

    return new Route(
      new RouteId(route.id),
      route.shortTitle,
      route.fullTitle,
      route.transportMode as TransportMode,
      stops,
      route.routeInfoUrl
    );
  }

  async getRoutesByStation(stationId: string): Promise<Route[]> {
    const routeStops = await this.prisma.routeStop.findMany({
      where: { stationId },
      include: {
        route: {
          include: {
            stops: {
              orderBy: { stopPosition: "asc" },
            },
          },
        },
      },
    });

    return routeStops.map(
      (rs: {
        route: {
          id: string;
          shortTitle: string;
          fullTitle: string;
          transportMode: string;
          routeInfoUrl: string | null;
          stops: { stationId: string }[];
        };
      }) => {
        const stops = rs.route.stops.map(
          (s: { stationId: string }) => new StationId(s.stationId)
        );

        return new Route(
          new RouteId(rs.route.id),
          rs.route.shortTitle,
          rs.route.fullTitle,
          rs.route.transportMode as TransportMode,
          stops,
          rs.route.routeInfoUrl
        );
      }
    );
  }
}
