import type { Route } from "../domain/entities"
import type { RouteId, StationId } from "../domain/valueObjects"
import type { RouteRepository } from "../repositories/routeRepository"
import type { Result } from "../external/yandex/utils/result"

export class RouteService {
  constructor(private readonly routeRepository: RouteRepository) {}

  /**
   * Gets all routes
   */
  async getAllRoutes(): Promise<Result<Route[]>> {
    return this.routeRepository.findAll()
  }

  /**
   * Gets a route by ID
   */
  async getRouteById(id: RouteId): Promise<Result<Route | null>> {
    return this.routeRepository.findById(id)
  }

  /**
   * Gets routes by station ID
   */
  async getRoutesByStationId(stationId: StationId): Promise<Result<Route[]>> {
    return this.routeRepository.findByStationId(stationId)
  }

  /**
   * Saves a route
   */
  async saveRoute(route: Route): Promise<Result<Route>> {
    return this.routeRepository.save(route)
  }
}
