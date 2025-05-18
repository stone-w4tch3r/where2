import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Route, RouteStop } from "./models";
import { TransportMode } from "../shared/dto/transport-mode.dto";
import { Prisma } from "@prisma/client";
import { RouteFilterDto } from "../routes/route-filter.dto";

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
    return routeStops.map((rs) => ({
      ...rs.route,
      transportMode: rs.route.transportMode as TransportMode,
    }));
  }

  async findRouteById(id: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        stops: {
          include: { station: true },
          orderBy: { stopPosition: "asc" },
        },
      },
    });
    return route
      ? { ...route, transportMode: route.transportMode as TransportMode }
      : null;
  }

  async findAllRoutes(filter?: RouteFilterDto): Promise<Route[]> {
    const where: Prisma.RouteWhereInput = {};
    if (filter) {
      if (filter.transportMode) where["transportMode"] = filter.transportMode;
    }
    const routes = await this.prisma.route.findMany({
      where,
      include: {
        stops: {
          include: { station: true },
          orderBy: { stopPosition: "asc" },
        },
      },
    });
    return routes.map((r) => ({
      ...r,
      transportMode: r.transportMode as TransportMode,
    }));
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
    const route = await this.prisma.route.findUnique({ where: { id } });
    return route
      ? { ...route, transportMode: route.transportMode as TransportMode }
      : null;
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
    transportType: TransportMode;
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
        transportMode: transportType as string,
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
