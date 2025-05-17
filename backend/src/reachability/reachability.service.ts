import { Injectable } from "@nestjs/common";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { Station, Route } from "@prisma/client";
import { NotFoundError, InternalError, AppError } from "../utils/errors";
import { Result, resultSuccess, resultError } from "../utils/Result";

export interface ReachabilityResult {
  origin: string;
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
@Injectable()
export class ReachabilityService {
  constructor(
    private readonly stationOrm: StationOrmService,
    private readonly routeOrm: RouteOrmService,
  ) {}

  /**
   * Calculate all stations reachable from a given origin station
   * within a maximum number of transfers
   */
  async calculateReachableStations(
    originId: string,
    maxTransfers: number,
  ): Promise<Result<ReachabilityResult, AppError>> {
    try {
      // Get the origin station
      const originStation = await this.stationOrm.findOne(originId);

      if (!originStation) {
        return resultError(
          new NotFoundError(`Origin station not found: ${originId}`),
        );
      }

      // Get all routes that contain this station
      const originRouteStops =
        await this.routeOrm.findRouteStopsByStation(originId);

      const originRoutes = originRouteStops.map((rs) => rs.route);

      // Initialize visited stations map with distances
      const visited = new Map<string, number>();
      visited.set(originId, 0);

      // Initialize queue with origin station and its routes
      const queue: Array<{
        stationId: string;
        transfers: number;
        routesSoFar: Set<string>;
      }> = [];

      // Initial state: all routes from origin station, 0 transfers
      for (const route of originRoutes) {
        const routeId = route.id;

        // Get all stops for this route
        const routeStops = await this.routeOrm.findRouteStopsByRoute(routeId);

        for (const stop of routeStops) {
          const stopId = stop.stationId;
          if (stopId !== originId) {
            queue.push({
              stationId: stopId,
              transfers: 0,
              routesSoFar: new Set([routeId]),
            });
            visited.set(stopId, 0);
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
        const stationRouteStops =
          await this.routeOrm.findRouteStopsByStation(stationId);

        const stationRoutes = stationRouteStops.map((rs) => rs.route);

        // For each route, add all stops that we haven't visited
        for (const route of stationRoutes) {
          const routeId = route.id;

          // Skip routes we've already taken
          if (routesSoFar.has(routeId)) {
            continue;
          }

          // Add new route to routes so far
          const updatedRoutes = new Set(routesSoFar);
          updatedRoutes.add(routeId);

          // Get all stops for this route
          const routeStops = await this.routeOrm.findRouteStopsByRoute(routeId);

          // For each stop in this route
          for (const stop of routeStops) {
            const stopId = stop.stationId;

            // Skip the current station
            if (stopId === stationId) {
              continue;
            }

            const newTransfers = transfers + 1;

            // If we haven't visited this station or we found a shorter path
            if (!visited.has(stopId) || visited.get(stopId)! > newTransfers) {
              visited.set(stopId, newTransfers);
              queue.push({
                stationId: stopId,
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
        if (stationId === originId) {
          continue;
        }

        const station = await this.stationOrm.findOne(stationId);

        if (!station) {
          console.warn(
            `Station ${stationId} not found in database but was in reachability results`,
          );
          continue;
        }

        // Get routes that connect this station
        const routeStops =
          await this.routeOrm.findRouteStopsByStation(stationId);

        const routes = routeStops.map((rs) => rs.route);

        reachableStations.push({
          station,
          transferCount,
          routes,
        });
      }

      return resultSuccess({
        origin: originId,
        maxTransfers,
        reachableStations,
      });
    } catch (error) {
      return resultError(
        new InternalError(`Error calculating reachable stations: ${error}`),
      );
    }
  }
}
