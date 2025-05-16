import { Injectable } from "@nestjs/common";
import { RouteOrmService } from "../prisma/route-orm.service";

@Injectable()
export class RoutesService {
  constructor(private readonly routeOrm: RouteOrmService) {}

  async findByStation(stationId: string) {
    try {
      return await this.routeOrm.findRoutesByStation(stationId);
    } catch (error) {
      throw new Error(`Failed to fetch routes: ${error}`);
    }
  }

  async findOne(id: string) {
    try {
      const route = await this.routeOrm.findRouteById(id);
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
      return await this.routeOrm.findAllRoutes();
    } catch (error) {
      throw new Error(`Failed to fetch routes: ${error}`);
    }
  }
}
