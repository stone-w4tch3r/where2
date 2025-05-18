import { Injectable, Logger } from "@nestjs/common";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { Station, Route } from "../prisma/models";
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
  private readonly logger = new Logger(ReachabilityService.name);

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
      this.logger.log(
        `Starting calculation from origin: ${originId}, maxTransfers: ${maxTransfers}`,
      );
      // Get the origin station
      const originStation = await this.stationOrm.findOne(originId);

      if (!originStation) {
        this.logger.warn(`Origin station not found: ${originId}`);
        return resultError(
          new NotFoundError(`Origin station not found: ${originId}`),
        );
      }

      // Get all routes that contain this station
      const originRouteStops =
        await this.routeOrm.findRouteStopsByStation(originId);

      const originRoutes = originRouteStops.map((rs) => rs.routeId);
      this.logger.log(`Origin routes: ${JSON.stringify(originRoutes)}`);

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
        const routeId = route;

        // Get all stops for this route
        const routeStops = await this.routeOrm.findRouteStopsByRoute(routeId);
        this.logger.log(
          `Route ${routeId} has stops: ${JSON.stringify(routeStops.map((s) => s.stationId))}`,
        );

        for (const stop of routeStops) {
          const stopId = stop.stationId;
          if (stopId !== originId) {
            queue.push({
              stationId: stopId,
              transfers: 0,
              routesSoFar: new Set([routeId]),
            });
            visited.set(stopId, 0);
            this.logger.log(
              `Enqueued initial station: ${stopId} via route ${routeId}`,
            );
          }
        }
      }

      // BFS to find reachable stations
      let iterations = 0;
      const MAX_ITERATIONS = 10000;
      while (queue.length > 0) {
        iterations++;
        if (iterations > MAX_ITERATIONS) {
          this.logger.error(
            `Exceeded max iterations (${MAX_ITERATIONS}). Possible loop detected. Breaking out.`,
          );
          break;
        }
        if (queue.length > 10000) {
          this.logger.warn(
            `Queue size unusually large (${queue.length}). Possible data issue or loop.`,
          );
        }
        const { stationId, transfers, routesSoFar } = queue.shift()!;
        this.logger.log(
          `Visiting station: ${stationId}, transfers: ${transfers}, routesSoFar: [${[...routesSoFar].join(", ")}]`,
        );

        // Skip if we've exceeded max transfers
        if (transfers >= maxTransfers) {
          this.logger.log(
            `Skipping station ${stationId} due to transfer limit (${transfers} >= ${maxTransfers})`,
          );
          continue;
        }

        // Get all routes for this station
        const stationRouteStops =
          await this.routeOrm.findRouteStopsByStation(stationId);

        const stationRoutes = stationRouteStops.map((rs) => rs.routeId);
        this.logger.log(
          `Station ${stationId} is on routes: ${JSON.stringify(stationRoutes)}`,
        );

        // For each route, add all stops that we haven't visited
        for (const route of stationRoutes) {
          const routeId = route;

          // Skip routes we've already taken
          if (routesSoFar.has(routeId)) {
            this.logger.log(`Already took route ${routeId}, skipping.`);
            continue;
          }

          // Add new route to routes so far
          const updatedRoutes = new Set(routesSoFar);
          updatedRoutes.add(routeId);

          // Get all stops for this route
          const routeStops = await this.routeOrm.findRouteStopsByRoute(routeId);
          this.logger.log(
            `Exploring route ${routeId} from station ${stationId}, stops: ${JSON.stringify(routeStops.map((s) => s.stationId))}`,
          );

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
              if (visited.has(stopId)) {
                this.logger.warn(
                  `Found shorter path to station ${stopId}: previous transfers ${visited.get(stopId)}, new transfers ${newTransfers}`,
                );
              }
              visited.set(stopId, newTransfers);
              queue.push({
                stationId: stopId,
                transfers: newTransfers,
                routesSoFar: updatedRoutes,
              });
              this.logger.log(
                `Enqueued station: ${stopId} with transfers: ${newTransfers}, routes: [${[...updatedRoutes].join(", ")}]`,
              );
            } else {
              this.logger.log(
                `Already visited station ${stopId} with equal or fewer transfers (${visited.get(stopId)}), skipping.`,
              );
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
          this.logger.warn(
            `Station ${stationId} not found in database but was in reachability results`,
          );
          continue;
        }

        // Get routes that connect this station
        const routeStops =
          await this.routeOrm.findRouteStopsByStation(stationId);

        // Fetch full Route objects for each routeId
        const routeIds = routeStops.map((rs) => rs.routeId);
        const routes: Route[] = [];
        for (const routeId of routeIds) {
          const route = await this.routeOrm.findRouteByIdSimple(routeId);
          if (route) {
            routes.push(route);
          }
        }

        reachableStations.push({
          station,
          transferCount,
          routes,
        });
      }

      this.logger.log(
        `Calculation complete. Reachable stations: ${reachableStations.length}`,
      );
      return resultSuccess({
        origin: originId,
        maxTransfers,
        reachableStations,
      });
    } catch (error) {
      this.logger.error(`Error calculating reachable stations: ${error}`);
      return resultError(
        new InternalError(`Error calculating reachable stations: ${error}`),
      );
    }
  }
}
