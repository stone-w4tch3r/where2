import { Route, RouteId } from "../models/Route";
import { StationId } from "../models/Station";
import { DatabaseService } from "./DatabaseService";
import { Result, success, failure } from "../utils/Result";

export class RouteService {
  constructor(private readonly dbService: DatabaseService) {}

  async getRoutesByStation(stationId: StationId): Promise<Result<Route[]>> {
    try {
      const routes = await this.dbService.getRoutesByStation(
        stationId.toString()
      );
      return success(routes);
    } catch (error) {
      return failure(new Error(`Failed to fetch routes: ${error}`));
    }
  }

  async getRouteById(routeId: RouteId): Promise<Result<Route>> {
    try {
      const route = await this.dbService.getRouteById(routeId.toString());

      if (!route) {
        return failure(new Error(`Route not found: ${routeId}`));
      }

      return success(route);
    } catch (error) {
      return failure(new Error(`Failed to fetch route: ${error}`));
    }
  }

  async getAllRoutes(): Promise<Result<Route[]>> {
    try {
      // In a real implementation, this would be paginated
      // For the purposes of this demo, we're returning everything
      // This would come from the database service
      return failure(new Error("Not implemented yet"));
    } catch (error) {
      return failure(new Error(`Failed to fetch routes: ${error}`));
    }
  }
}
