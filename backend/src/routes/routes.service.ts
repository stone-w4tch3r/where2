import { Injectable } from "@nestjs/common";
import { RouteOrmService } from "../prisma/route-orm.service";
import { Result, resultSuccess, resultError } from "../utils/Result";
import { AppError, NotFoundError, InternalError } from "../utils/errors";

@Injectable()
export class RoutesService {
  constructor(private readonly routeOrm: RouteOrmService) {}

  async findByStation(stationId: string): Promise<Result<any, AppError>> {
    try {
      const routes = await this.routeOrm.findRoutesByStation(stationId);
      return resultSuccess(routes);
    } catch (error) {
      return resultError(new InternalError(`Failed to fetch routes: ${error}`));
    }
  }

  async findOne(id: string): Promise<Result<any, AppError>> {
    try {
      const route = await this.routeOrm.findRouteById(id);
      if (!route) {
        return resultError(new NotFoundError(`Route not found: ${id}`));
      }
      return resultSuccess(route);
    } catch (error) {
      return resultError(new InternalError(`Failed to fetch route: ${error}`));
    }
  }

  async findAll(): Promise<Result<any, AppError>> {
    try {
      const routes = await this.routeOrm.findAllRoutes();
      return resultSuccess(routes);
    } catch (error) {
      return resultError(new InternalError(`Failed to fetch routes: ${error}`));
    }
  }
}
