import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByStation(stationId: string) {
    try {
      // Get routes for this station
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

      // Extract routes from route stops
      return routeStops.map((rs) => rs.route);
    } catch (error) {
      throw new Error(`Failed to fetch routes: ${error}`);
    }
  }

  async findOne(id: string) {
    try {
      const route = await this.prisma.route.findUnique({
        where: { id },
        include: {
          stops: {
            include: { station: true },
            orderBy: { stopPosition: "asc" },
          },
        },
      });

      if (!route) {
        throw new Error(`Route not found: ${id}`);
      }

      return route;
    } catch (error) {
      throw new Error(`Failed to fetch route: ${error}`);
    }
  }

  async findAll() {
    try {
      // In a real implementation, this would be paginated
      return await this.prisma.route.findMany({
        include: {
          stops: {
            include: { station: true },
            orderBy: { stopPosition: "asc" },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch routes: ${error}`);
    }
  }
}
