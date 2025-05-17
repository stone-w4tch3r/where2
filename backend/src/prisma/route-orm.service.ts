import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Route, RouteStop } from "./models";

@Injectable()
export class RouteOrmService {
  constructor(private readonly prisma: PrismaService) {}

  async findRoutesByStation(stationId: string): Promise<Route[]> {
    const routeStops = await this.prisma.routeStop.findMany({
      where: { stationId },
      include: {
        route: {
          include: {
            stops: {
              include: { station: true },
              orderBy: { stopPosition: "asc" },
            },
          },
        },
      },
    });
    return routeStops.map((rs) => rs.route);
  }

  async findRouteById(id: string): Promise<Route | null> {
    return this.prisma.route.findUnique({
      where: { id },
      include: {
        stops: {
          include: { station: true },
          orderBy: { stopPosition: "asc" },
        },
      },
    });
  }

  async findAllRoutes(): Promise<Route[]> {
    return this.prisma.route.findMany({
      include: {
        stops: {
          include: { station: true },
          orderBy: { stopPosition: "asc" },
        },
      },
    });
  }

  async findRouteStopsByStation(stationId: string): Promise<RouteStop[]> {
    return this.prisma.routeStop.findMany({
      where: { stationId },
      include: { route: true },
    });
  }

  async findRouteStopsByRoute(routeId: string): Promise<RouteStop[]> {
    return this.prisma.routeStop.findMany({
      where: { routeId },
      include: { station: true },
      orderBy: { stopPosition: "asc" },
    });
  }

  async findRouteByIdSimple(id: string): Promise<Route | null> {
    return this.prisma.route.findUnique({ where: { id } });
  }

  async upsertRouteWithStops({
    threadUid,
    shortTitle,
    fullTitle,
    transportType,
    routeInfoUrl,
    stopIds,
  }: {
    threadUid: string;
    shortTitle: string;
    fullTitle: string;
    transportType: string;
    routeInfoUrl: string | null;
    stopIds: string[];
  }) {
    await this.prisma.$transaction(async (tx) => {
      // Get existing route
      const existingRoute = await tx.route.findUnique({
        where: { id: threadUid },
      });

      // Create comparison objects with exactly the same structure
      const existingRouteData = existingRoute
        ? {
            shortTitle: existingRoute.shortTitle,
            fullTitle: existingRoute.fullTitle,
            transportMode: existingRoute.transportMode,
            routeInfoUrl: existingRoute.routeInfoUrl,
          }
        : null;

      const newRouteData = {
        shortTitle,
        fullTitle,
        transportMode: transportType,
        routeInfoUrl,
      };

      // Check if route needs to be created or updated by comparing the objects
      const routeChanged =
        !existingRouteData ||
        JSON.stringify(existingRouteData) !== JSON.stringify(newRouteData);

      // Only upsert the route if something has changed
      if (routeChanged) {
        await tx.route.upsert({
          where: { id: threadUid },
          update: newRouteData,
          create: {
            id: threadUid,
            ...newRouteData,
          },
        });
      }

      // Get existing route stops
      const existingStops = await tx.routeStop.findMany({
        where: { routeId: threadUid },
        orderBy: { stopPosition: "asc" },
      });

      // Create a normalized representation of existing stops for comparison
      const existingStopsData = existingStops.map((stop, index) => ({
        stationId: stop.stationId,
        position: stop.stopPosition,
      }));

      // Create a normalized representation of new stops for comparison
      const newStopsData = stopIds.map((stationId, index) => ({
        stationId,
        position: index,
      }));

      // Compare the serialized structures
      const stopsChanged =
        JSON.stringify(existingStopsData) !== JSON.stringify(newStopsData);

      if (stopsChanged) {
        // Delete existing route stops
        await tx.routeStop.deleteMany({
          where: { routeId: threadUid },
        });

        // Add new route stops
        for (let i = 0; i < stopIds.length; i++) {
          await tx.routeStop.create({
            data: {
              routeId: threadUid,
              stationId: stopIds[i],
              stopPosition: i,
            },
          });
        }
      }
    });
  }
}
