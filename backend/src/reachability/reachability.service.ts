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

  public readonly MAX_ITERATIONS = 1000;
  public readonly MAX_QUEUE_SIZE = 1000;

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

      /* -----------------------------------------------------------------
       * 0. Fetch origin station
       * ----------------------------------------------------------------- */
      const originStation = await this.stationOrm.findOne(originId);

      if (!originStation) {
        this.logger.warn(`Origin station not found: ${originId}`);
        return resultError(
          new NotFoundError(`Origin station not found: ${originId}`),
        );
      }

      /* -----------------------------------------------------------------
       * 1. Lightweight in-memory caches for DB look-ups
       * ----------------------------------------------------------------- */
      // routeId  ->  minimal list of {stationId, stopPosition}
      const routeStopsCache = new Map<
        string,
        Array<{ stationId: string; stopPosition: number }>
      >();

      // stationId -> all route-stop rows for that station
      const stationRouteStopsCache = new Map<
        string,
        Array<{
          routeId: string;
          stationId: string;
          id: number;
          stopPosition: number;
        }>
      >();

      const getStationRouteStops = async (
        sId: string,
      ): Promise<
        Array<{
          routeId: string;
          stationId: string;
          id: number;
          stopPosition: number;
        }>
      > => {
        if (!stationRouteStopsCache.has(sId)) {
          stationRouteStopsCache.set(
            sId,
            await this.routeOrm.findRouteStopsByStation(sId),
          );
        }
        return stationRouteStopsCache.get(sId)!;
      };

      /* -----------------------------------------------------------------
       * 2. Routes that start at the origin
       * ----------------------------------------------------------------- */
      const originRouteStops = await getStationRouteStops(originId);
      const originRoutes = originRouteStops.map((rs) => rs.routeId);

      this.logger.log(`Origin routes: ${JSON.stringify(originRoutes)}`);

      // Pre-fill routeStopsCache for those routes
      for (const routeId of originRoutes) {
        const stops = await this.routeOrm.findRouteStopsByRoute(routeId);
        routeStopsCache.set(
          routeId,
          stops.map(({ stationId, stopPosition }) => ({
            stationId,
            stopPosition,
          })),
        );
      }

      /* -----------------------------------------------------------------
       * 3. State tracking:  visitedTransfers  **fixes the explosion**
       * -----------------------------------------------------------------
       *   stationId -> minimal number of transfers seen so far
       *   We enqueue a station again only if we can reach it with *fewer*
       *   transfers than before.  This alone eliminates the “one entry
       *   per distinct routeSet” blow-up that caused the old loop.
       * ----------------------------------------------------------------- */
      const visitedTransfers = new Map<string, number>();
      visitedTransfers.set(originId, 0);

      interface QueueItem {
        stationId: string;
        transfers: number;
        routesSoFar: Set<string>;
      }

      const queue: QueueItem[] = [];

      // seed queue: every stop (≠ origin) of each origin route
      for (const routeId of originRoutes) {
        const stops = routeStopsCache.get(routeId)!;

        this.logger.log(
          `Route ${routeId} has stops: ${JSON.stringify(stops.map((s) => s.stationId))}`,
        );

        for (const stop of stops) {
          if (stop.stationId === originId) continue;

          if (!visitedTransfers.has(stop.stationId)) {
            visitedTransfers.set(stop.stationId, 0);
            queue.push({
              stationId: stop.stationId,
              transfers: 0,
              routesSoFar: new Set([routeId]),
            });
            this.logger.log(
              `Enqueued initial station: ${stop.stationId} via route ${routeId}`,
            );
          }
        }
      }

      /* -----------------------------------------------------------------
       * 4. Breadth-first search
       * ----------------------------------------------------------------- */
      let iterations = 0;
      const processedStationsInBfs = new Set<string>();

      while (queue.length) {
        iterations++;
        if (iterations > this.MAX_ITERATIONS) {
          this.logger.error(
            `Exceeded max iterations (${this.MAX_ITERATIONS}). Possible loop detected. Breaking out.`,
          );
          break;
        }
        if (queue.length > this.MAX_QUEUE_SIZE) {
          this.logger.warn(
            `Queue size unusually large (${queue.length}). Possible data issue or loop.`,
          );
        }

        const { stationId, transfers, routesSoFar } = queue.shift()!;

        this.logger.log(
          `Visiting station: ${stationId}, transfers: ${transfers}, routesSoFar: [${[
            ...routesSoFar,
          ].join(", ")}]`,
        );

        if (transfers >= maxTransfers) {
          this.logger.log(
            `Skipping station ${stationId} due to transfer limit (${transfers} >= ${maxTransfers})`,
          );
          continue;
        }

        // Fetch this station’s route list once per BFS run
        if (!processedStationsInBfs.has(stationId)) {
          processedStationsInBfs.add(stationId);

          const stationRouteStops = await getStationRouteStops(stationId);
          const stationRoutes = stationRouteStops.map((rs) => rs.routeId);

          this.logger.log(
            `Station ${stationId} is on routes: ${JSON.stringify(stationRoutes)}`,
          );

          for (const routeId of stationRoutes) {
            if (routesSoFar.has(routeId)) {
              this.logger.log(`Already took route ${routeId}, skipping.`);
              continue;
            }

            const nextTransfers = transfers + 1;
            if (nextTransfers > maxTransfers) continue;

            if (!routeStopsCache.has(routeId)) {
              const stops = await this.routeOrm.findRouteStopsByRoute(routeId);
              routeStopsCache.set(
                routeId,
                stops.map(({ stationId, stopPosition }) => ({
                  stationId,
                  stopPosition,
                })),
              );
            }

            const routeStops = routeStopsCache.get(routeId)!;

            this.logger.log(
              `Exploring route ${routeId} from station ${stationId}, stops: ${JSON.stringify(
                routeStops.map((s) => s.stationId),
              )}`,
            );

            const updatedRoutes = new Set(routesSoFar);
            updatedRoutes.add(routeId);

            for (const stop of routeStops) {
              if (stop.stationId === stationId) continue;

              // enqueue *only* if we improve on the best transfer count
              if (
                !visitedTransfers.has(stop.stationId) ||
                visitedTransfers.get(stop.stationId)! > nextTransfers
              ) {
                visitedTransfers.set(stop.stationId, nextTransfers);
                queue.push({
                  stationId: stop.stationId,
                  transfers: nextTransfers,
                  routesSoFar: updatedRoutes,
                });
                this.logger.log(
                  `Enqueued station: ${stop.stationId} with transfers: ${nextTransfers}, routes: [${[
                    ...updatedRoutes,
                  ].join(", ")}]`,
                );
              }
            }
          }
        }
      }

      /* -----------------------------------------------------------------
       * 5. Build and return result
       * ----------------------------------------------------------------- */
      const reachableStations: ReachabilityResult["reachableStations"] = [];

      for (const [stationId, transferCount] of visitedTransfers) {
        if (stationId === originId) continue;

        const station = await this.stationOrm.findOne(stationId);
        if (!station) {
          this.logger.warn(
            `Station ${stationId} not found in database but was in reachability results`,
          );
          continue;
        }

        const routeStops = await getStationRouteStops(stationId);
        const routes: Route[] = [];

        for (const { routeId } of routeStops) {
          const route = await this.routeOrm.findRouteByIdSimple(routeId);
          if (route) routes.push(route);
        }

        reachableStations.push({ station, transferCount, routes });
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
