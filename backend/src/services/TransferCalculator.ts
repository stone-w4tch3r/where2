import { Station, StationId } from "../models/Station";
import { Route } from "../models/Route";
import { DatabaseService } from "./DatabaseService";
import { Result, success, failure } from "../utils/Result";

interface ReachabilityResult {
  origin: StationId;
  maxTransfers: number;
  reachableStations: {
    station: Station;
    transferCount: number;
    routes: Route[];
  }[];
}

/**
 * Service for calculating transfer routes between stations
 */
export class TransferCalculator {
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Calculate all stations reachable from a given origin station
   * within a maximum number of transfers
   */
  async calculateReachableStations(
    originId: StationId,
    maxTransfers: number
  ): Promise<Result<ReachabilityResult>> {
    try {
      // Get the origin station
      const originStation = await this.dbService.getStationById(
        originId.toString()
      );
      if (!originStation) {
        return failure(new Error(`Origin station not found: ${originId}`));
      }

      // Get all routes that contain this station
      const originRoutes = await this.dbService.getRoutesByStation(
        originId.toString()
      );

      // Initialize visited stations map with distances
      const visited = new Map<string, number>();
      visited.set(originId.toString(), 0);

      // Initialize queue with origin station and its routes
      const queue: Array<{
        stationId: string;
        transfers: number;
        routesSoFar: Set<string>;
      }> = [];

      // Initial state: all routes from origin station, 0 transfers
      for (const route of originRoutes) {
        const routeId = route.id.toString();
        for (const stopId of route.stops) {
          const stopIdStr = stopId.toString();
          if (stopIdStr !== originId.toString()) {
            queue.push({
              stationId: stopIdStr,
              transfers: 0,
              routesSoFar: new Set([routeId]),
            });
            visited.set(stopIdStr, 0);
          }
        }
      }

      // BFS to find reachable stations
      while (queue.length > 0) {
        const { stationId, transfers, routesSoFar } = queue.shift()!;

        // Skip if we've exceeded max transfers
        if (transfers >= maxTransfers) {
          continue;
        }

        // Get all routes for this station
        const stationRoutes = await this.dbService.getRoutesByStation(
          stationId
        );

        // For each route, add all stops that we haven't visited
        for (const route of stationRoutes) {
          const routeId = route.id.toString();

          // Skip routes we've already taken
          if (routesSoFar.has(routeId)) {
            continue;
          }

          // Add new route to routes so far
          const updatedRoutes = new Set(routesSoFar);
          updatedRoutes.add(routeId);

          // For each stop in this route
          for (const stopId of route.stops) {
            const stopIdStr = stopId.toString();

            // Skip the current station
            if (stopIdStr === stationId) {
              continue;
            }

            const newTransfers = transfers + 1;

            // If we haven't visited this station or we found a shorter path
            if (
              !visited.has(stopIdStr) ||
              visited.get(stopIdStr)! > newTransfers
            ) {
              visited.set(stopIdStr, newTransfers);
              queue.push({
                stationId: stopIdStr,
                transfers: newTransfers,
                routesSoFar: updatedRoutes,
              });
            }
          }
        }
      }

      // Build result by fetching full station objects
      const reachableStations: ReachabilityResult["reachableStations"] = [];

      for (const [stationId, transferCount] of visited.entries()) {
        // Skip the origin station
        if (stationId === originId.toString()) {
          continue;
        }

        const station = await this.dbService.getStationById(stationId);
        if (!station) {
          console.warn(
            `Station ${stationId} not found in database but was in reachability results`
          );
          continue;
        }

        // Get routes that connect this station
        const routes = await this.dbService.getRoutesByStation(stationId);

        reachableStations.push({
          station,
          transferCount,
          routes,
        });
      }

      return success({
        origin: originId,
        maxTransfers,
        reachableStations,
      });
    } catch (error) {
      return failure(
        new Error(`Error calculating reachable stations: ${error}`)
      );
    }
  }
}
