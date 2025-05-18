import { Injectable, Logger } from "@nestjs/common";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { Station, Route } from "../prisma/models";
import { NotFoundError, InternalError, AppError } from "../utils/errors";
import { Result, resultSuccess, resultError } from "../utils/Result";

// -----------------------------------------------------------------------------
// Helper types
// -----------------------------------------------------------------------------
type RouteStopMin = {
  stationId: string;
  stopPosition: number;
};

// Raw row as returned by Prisma for station‑route lookup
// (keep it in one place so tests can stub it easily)
type RouteStopRaw = {
  routeId: string;
  stationId: string;
  id: number;
  stopPosition: number;
};

export interface ReachabilityResult {
  origin: string;
  maxTransfers: number;
  reachableStations: {
    station: Station;
    transferCount: number;
    routes: Route[];
  }[];
}

// -----------------------------------------------------------------------------
// Data‑access layer (all caching / Prisma calls live here)
// -----------------------------------------------------------------------------
export class ReachabilityData {
  constructor(
    private readonly stationOrm: StationOrmService,
    private readonly routeOrm: RouteOrmService,
  ) {}

  private readonly stationCache = new Map<string, Station | null>();
  private readonly routeStopsCache = new Map<string, RouteStopMin[]>();
  private readonly stationRouteStopsCache = new Map<string, RouteStopRaw[]>();

  async getStation(id: string): Promise<Station | null> {
    if (!this.stationCache.has(id)) {
      this.stationCache.set(id, await this.stationOrm.findOne(id));
    }
    return this.stationCache.get(id) ?? null;
  }

  async getRouteStops(routeId: string): Promise<RouteStopMin[]> {
    if (!this.routeStopsCache.has(routeId)) {
      const rows = await this.routeOrm.findRouteStopsByRoute(routeId);
      this.routeStopsCache.set(
        routeId,
        rows.map(({ stationId, stopPosition }) => ({
          stationId,
          stopPosition,
        })),
      );
    }
    return this.routeStopsCache.get(routeId)!;
  }

  async getStationRouteStops(stationId: string): Promise<RouteStopRaw[]> {
    if (!this.stationRouteStopsCache.has(stationId)) {
      this.stationRouteStopsCache.set(
        stationId,
        await this.routeOrm.findRouteStopsByStation(stationId),
      );
    }
    return this.stationRouteStopsCache.get(stationId)!;
  }

  async getRoutesForStation(stationId: string): Promise<string[]> {
    const rows = await this.getStationRouteStops(stationId);
    return rows.map((r) => r.routeId);
  }

  async getRoute(routeId: string): Promise<Route | null> {
    return this.routeOrm.findBaseRouteById(routeId);
  }
}

// -----------------------------------------------------------------------------
// Reachability algorithm (pure BFS)
// -----------------------------------------------------------------------------
@Injectable()
export class ReachabilityService {
  private readonly logger = new Logger(ReachabilityService.name);

  public readonly MAX_ITERATIONS = 1_000;
  public readonly MAX_QUEUE_SIZE = 1_000;

  private readonly db: ReachabilityData;

  constructor(stationOrm: StationOrmService, routeOrm: RouteOrmService) {
    this.db = new ReachabilityData(stationOrm, routeOrm);
  }

  async calculateReachableStations(
    originId: string,
    maxTransfers: number,
  ): Promise<Result<ReachabilityResult, AppError>> {
    this.logger.log(
      `Calculating reachable stations for origin ${originId} with maxTransfers ${maxTransfers}`,
    );
    try {
      // --- 0. Origin ----------------------------------------------------
      const originStation = await this.db.getStation(originId);
      if (!originStation) {
        this.logger.warn(`Origin station not found: ${originId}`);
        return resultError(
          new NotFoundError(`Origin station not found: ${originId}`),
        );
      }
      this.logger.debug(`Origin station: ${JSON.stringify(originStation)}`);

      // --- 1. BFS setup ------------------------------------------------
      type QueueItem = {
        stationId: string;
        transfers: number;
        usedRoutes: Set<string>;
      };

      const queue: QueueItem[] = [];
      const bestTransfers = new Map<string, number>().set(originId, 0);

      const enqueue = (
        stationId: string,
        transfers: number,
        usedRoutes: Set<string>,
      ): void => {
        const best = bestTransfers.get(stationId);
        if (best === undefined || transfers < best) {
          bestTransfers.set(stationId, transfers);
          queue.push({ stationId, transfers, usedRoutes });
          this.logger.debug(
            `Enqueued station ${stationId} with ${transfers} transfers. Queue size: ${queue.length}`,
          );
        }
      };

      const seedRoutes = await this.db.getRoutesForStation(originId);
      this.logger.debug(
        `Found ${seedRoutes.length} seed routes for origin ${originId}`,
      );
      for (const routeId of seedRoutes) {
        const stops = await this.db.getRouteStops(routeId);
        for (const stop of stops) {
          if (stop.stationId !== originId) {
            enqueue(stop.stationId, 0, new Set([routeId]));
          }
        }
      }

      // --- 2. BFS loop -------------------------------------------------
      let iterations = 0;
      this.logger.log(`Starting BFS. Initial queue size: ${queue.length}`);
      while (queue.length) {
        if (++iterations > this.MAX_ITERATIONS) {
          this.logger.error(
            `Exceeded MAX_ITERATIONS (${this.MAX_ITERATIONS}), breaking`,
          );
          break;
        }
        if (queue.length > this.MAX_QUEUE_SIZE) {
          this.logger.warn(
            `Queue size ${queue.length} exceeds MAX_QUEUE_SIZE (${this.MAX_QUEUE_SIZE})`,
          );
        }

        const { stationId, transfers, usedRoutes } = queue.shift()!;
        this.logger.debug(
          `Processing station ${stationId} with ${transfers} transfers. Queue size: ${queue.length}`,
        );
        if (transfers >= maxTransfers) {
          this.logger.debug(
            `Skipping station ${stationId}: transfers (${transfers}) >= maxTransfers (${maxTransfers})`,
          );
          continue;
        }

        for (const routeId of await this.db.getRoutesForStation(stationId)) {
          if (usedRoutes.has(routeId)) {
            this.logger.debug(
              `Skipping route ${routeId} for station ${stationId}: already used`,
            );
            continue; // already taken
          }

          const nextTransfers = transfers + 1;
          if (nextTransfers > maxTransfers) {
            this.logger.debug(
              `Skipping route ${routeId} for station ${stationId}: nextTransfers (${nextTransfers}) > maxTransfers (${maxTransfers})`,
            );
            continue;
          }

          const nextUsedRoutes = new Set(usedRoutes).add(routeId);
          for (const stop of await this.db.getRouteStops(routeId)) {
            if (stop.stationId !== stationId) {
              enqueue(stop.stationId, nextTransfers, nextUsedRoutes);
            }
          }
        }
      }
      this.logger.log(`BFS completed in ${iterations} iterations.`);

      // --- 3. Build result ---------------------------------------------
      const reachableStations: ReachabilityResult["reachableStations"] = [];

      for (const [stationId, transferCount] of bestTransfers) {
        if (stationId === originId) continue;

        const station = await this.db.getStation(stationId);
        if (!station) {
          this.logger.warn(
            `Reachable station ${stationId} not found in DB during result building. This should not happen.`,
          );
          continue; // should not happen, but guard anyway
        }

        const routes = (
          await Promise.all(
            (await this.db.getRoutesForStation(stationId)).map((r) =>
              this.db.getRoute(r),
            ),
          )
        ).filter(Boolean) as Route[];

        reachableStations.push({ station, transferCount, routes });
      }

      this.logger.log(
        `Found ${reachableStations.length} reachable stations for origin ${originId}`,
      );
      return resultSuccess({
        origin: originId,
        maxTransfers,
        reachableStations,
      });
    } catch (err) {
      this.logger.error(
        `Error in reachability calculation for origin ${originId}`,
        err,
      );
      return resultError(
        new InternalError(`Error calculating reachable stations: ${err}`),
      );
    }
  }
}
