import { type ReachabilityQuery, ReachabilityResult, type Route } from "../domain/entities"
import { RouteId, StationId } from "../domain/valueObjects"
import type { RouteRepository } from "../repositories/routeRepository"
import { type Result, createSuccess, createFailure } from "../external/yandex/utils/result"

export class ReachabilityService {
  constructor(private readonly routeRepository: RouteRepository) {}

  /**
   * Calculates reachable stations from a given station with a maximum number of transfers
   */
  async calculateReachability(query: ReachabilityQuery): Promise<Result<ReachabilityResult>> {
    try {
      // Get routes for the origin station
      const routesResult = await this.routeRepository.findByStationId(query.origin)
      if (!routesResult.success) {
        return createFailure(`Failed to get routes: ${routesResult.message}`)
      }

      const routes = routesResult.data

      // If no routes found, return empty result
      if (routes.length === 0) {
        return createSuccess(new ReachabilityResult(query.origin, 0, [], []))
      }

      // Set to track visited stations
      const visitedStations = new Set<string>()
      // Set to track connected routes
      const connectedRoutes = new Set<string>()

      // Add origin station to visited
      visitedStations.add(query.origin.value)

      // Add direct routes to connected routes
      routes.forEach((route) => connectedRoutes.add(route.id.value))

      // Get directly reachable stations (0 transfers)
      const directlyReachable = this.getDirectlyReachableStations(routes)
      directlyReachable.forEach((station) => visitedStations.add(station.value))

      // If max transfers is 0, return directly reachable stations
      if (query.maxTransfers === 0) {
        return createSuccess(
          new ReachabilityResult(
            query.origin,
            0,
            Array.from(visitedStations).map((id) => new StationId(id)),
            Array.from(connectedRoutes).map((id) => new RouteId(id)),
          ),
        )
      }

      // Perform BFS for transfers
      await this.performBFS(directlyReachable, visitedStations, connectedRoutes, query.maxTransfers)

      // Convert sets back to arrays of value objects
      const reachableStations = Array.from(visitedStations).map((id) => new StationId(id))

      const reachableRoutes = Array.from(connectedRoutes).map((id) => new RouteId(id))

      return createSuccess(new ReachabilityResult(query.origin, query.maxTransfers, reachableStations, reachableRoutes))
    } catch (error) {
      return createFailure(
        `Failed to calculate reachability: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Gets directly reachable stations from a set of routes
   */
  private getDirectlyReachableStations(routes: Route[]): StationId[] {
    const reachableStations = new Set<string>()

    routes.forEach((route) => {
      route.stops.forEach((stop) => {
        reachableStations.add(stop.value)
      })
    })

    return Array.from(reachableStations).map((id) => new StationId(id))
  }

  /**
   * Performs BFS to find stations reachable with transfers
   */
  private async performBFS(
    frontier: StationId[],
    visitedStations: Set<string>,
    connectedRoutes: Set<string>,
    maxTransfers: number,
  ): Promise<void> {
    let currentTransfer = 1
    let currentFrontier = [...frontier]

    while (currentTransfer <= maxTransfers && currentFrontier.length > 0) {
      const nextFrontier: StationId[] = []

      // Process each station in the current frontier
      for (const station of currentFrontier) {
        // Get routes for this station
        const routesResult = await this.routeRepository.findByStationId(station)
        if (!routesResult.success) {
          console.error(`Failed to get routes for station ${station.value}: ${routesResult.message}`)
          continue
        }

        const routes = routesResult.data

        // Add routes to connected routes
        routes.forEach((route) => connectedRoutes.add(route.id.value))

        // Process each route
        for (const route of routes) {
          // Process each stop in the route
          for (const stop of route.stops) {
            // If we haven't visited this station yet
            if (!visitedStations.has(stop.value)) {
              visitedStations.add(stop.value)
              nextFrontier.push(stop)
            }
          }
        }
      }

      // Move to next transfer level
      currentFrontier = nextFrontier
      currentTransfer++
    }
  }
}
