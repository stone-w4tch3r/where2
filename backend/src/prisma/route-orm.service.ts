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
      // Save the route
      await tx.route.upsert({
        where: { id: threadUid },
        update: {
          shortTitle,
          fullTitle,
          transportMode: transportType,
          routeInfoUrl,
        },
        create: {
          id: threadUid,
          shortTitle,
          fullTitle,
          transportMode: transportType,
          routeInfoUrl,
        },
      });

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
    });
  }
}
