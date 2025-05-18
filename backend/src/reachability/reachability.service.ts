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

      // Cache for routes and their stops to avoid repeated DB queries
      const routeStopsCache = new Map<
        string,
        Array<{ stationId: string; stopPosition: number }>
      >();

      // Fetch route stops for all origin routes at once to reduce DB calls
      for (const routeId of originRoutes) {
        const stops = await this.routeOrm.findRouteStopsByRoute(routeId);
        routeStopsCache.set(
          routeId,
          stops.map((stop) => ({
            stationId: stop.stationId,
            stopPosition: stop.stopPosition,
          })),
        );
      }

      // Initialize visited map: stationId -> Set of unique keys (transfers + routesSoFar)
      const visited = new Map<string, Set<string>>();
      // Helper to create a unique key for visited state
      const makeVisitedKey = (
        transfers: number,
        routesSoFar: Set<string>,
      ): string => {
        return `${transfers}|${[...routesSoFar].sort().join(",")}`;
      };
      // Mark origin as visited with 0 transfers and no routes
      visited.set(originId, new Set([makeVisitedKey(0, new Set())]));

      // Initialize queue with origin station and its routes
      const queue: Array<{
        stationId: string;
        transfers: number;
        routesSoFar: Set<string>;
      }> = [];

      // Initial state: all routes from origin station, 0 transfers
      for (const routeId of originRoutes) {
        // Get stops for this route (using cache)
        const routeStops = routeStopsCache.get(routeId) || [];

        this.logger.log(
          `Route ${routeId} has stops: ${JSON.stringify(routeStops.map((s) => s.stationId))}`,
        );

        for (const stop of routeStops) {
          const stopId = stop.stationId;
          if (stopId !== originId) {
            const routesSoFar = new Set([routeId]);
            const key = makeVisitedKey(0, routesSoFar);
            if (!visited.has(stopId)) visited.set(stopId, new Set());
            if (!visited.get(stopId)!.has(key)) {
              queue.push({
                stationId: stopId,
                transfers: 0,
                routesSoFar,
              });
              visited.get(stopId)!.add(key);
              this.logger.log(
                `Enqueued initial station: ${stopId} via route ${routeId}`,
              );
            }
          }
        }
      }

      // BFS to find reachable stations
      let iterations = 0;
      const MAX_ITERATIONS = 1000;
      const MAX_QUEUE_SIZE = 1000;

      // Set to track stations we've processed to avoid duplicate DB queries
      const processedStations = new Set<string>();

      while (queue.length > 0) {
        iterations++;
        if (iterations > MAX_ITERATIONS) {
          this.logger.error(
            `Exceeded max iterations (${MAX_ITERATIONS}). Possible loop detected. Breaking out.`,
          );
          break;
        }
        if (queue.length > MAX_QUEUE_SIZE) {
          this.logger.warn(
            `Queue size unusually large (${queue.length}). Possible data issue or loop.`,
          );
        }

        const { stationId, transfers, routesSoFar } = queue.shift()!;

        this.logger.log(
          `Visiting station: ${stationId}, transfers: ${transfers}, routesSoFar: [${[...routesSoFar].join(", ")}]`,
        );

        if (transfers >= maxTransfers) {
          this.logger.log(
            `Skipping station ${stationId} due to transfer limit (${transfers} >= ${maxTransfers})`,
          );
          continue;
        }

        // Only fetch station routes from DB if we haven't processed this station yet
        if (!processedStations.has(stationId)) {
          processedStations.add(stationId);

          const stationRouteStops =
            await this.routeOrm.findRouteStopsByStation(stationId);
          const stationRoutes = stationRouteStops.map((rs) => rs.routeId);

          this.logger.log(
            `Station ${stationId} is on routes: ${JSON.stringify(stationRoutes)}`,
          );

          for (const routeId of stationRoutes) {
            if (routesSoFar.has(routeId)) {
              this.logger.log(`Already took route ${routeId}, skipping.`);
              continue;
            }

            // Skip if adding this route would exceed max transfers
            if (transfers + 1 > maxTransfers) {
              continue;
            }

            const updatedRoutes = new Set(routesSoFar);
            updatedRoutes.add(routeId);

            // Check if we've already processed this route
            if (!routeStopsCache.has(routeId)) {
              const routeStops =
                await this.routeOrm.findRouteStopsByRoute(routeId);
              routeStopsCache.set(
                routeId,
                routeStops.map((stop) => ({
                  stationId: stop.stationId,
                  stopPosition: stop.stopPosition,
                })),
              );
            }

            const routeStops = routeStopsCache.get(routeId) || [];

            this.logger.log(
              `Exploring route ${routeId} from station ${stationId}, stops: ${JSON.stringify(routeStops.map((s) => s.stationId))}`,
            );

            for (const stop of routeStops) {
              const stopId = stop.stationId;
              if (stopId === stationId) {
                continue;
              }

              // Skip stations that would require going back to already-visited stations
              // with the same route combination (prevents looping)
              const newKey = makeVisitedKey(transfers + 1, updatedRoutes);
              if (!visited.has(stopId)) {
                visited.set(stopId, new Set());
              } else if (visited.get(stopId)!.has(newKey)) {
                // We've already planned to visit this station with these exact routes and transfers
                continue;
              }

              visited.get(stopId)!.add(newKey);
              queue.push({
                stationId: stopId,
                transfers: transfers + 1,
                routesSoFar: updatedRoutes,
              });

              this.logger.log(
                `Enqueued station: ${stopId} with transfers: ${transfers + 1}, routes: [${[...updatedRoutes].join(", ")}]`,
              );
            }
          }
        }
      }

      // Build result by fetching full station objects
      const reachableStations: ReachabilityResult["reachableStations"] = [];

      // For each station, find the minimum transfer count among all visited states
      for (const [stationId, visitedStates] of visited.entries()) {
        if (stationId === originId) continue;
        // Find the minimum transfer count from the visited keys
        let minTransferCount = Infinity;
        for (const key of visitedStates) {
          const transferCount = parseInt(key.split("|")[0], 10);
          if (transferCount < minTransferCount)
            minTransferCount = transferCount;
        }
        if (minTransferCount === Infinity) continue;
        const station = await this.stationOrm.findOne(stationId);
        if (!station) {
          this.logger.warn(
            `Station ${stationId} not found in database but was in reachability results`,
          );
          continue;
        }
        const routeStops =
          await this.routeOrm.findRouteStopsByStation(stationId);
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
          transferCount: minTransferCount,
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
