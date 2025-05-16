import { Route } from "../models/Route";
import { StationId } from "../models/Station";
import { ReachabilityQuery, ReachabilityResult } from "../models/Reachability";
import { RouteService } from "./RouteService";
import { Result, success, failure } from "../utils/Result";

export class TransferCalculator {
  constructor(private readonly routeService: RouteService) {}

  async calculateReachableStations(
    query: ReachabilityQuery
  ): Promise<Result<ReachabilityResult>> {
    try {
      // Step 1: Get all routes for the origin station
      const routesResult = await this.routeService.getRoutesByStation(
        query.origin
      );

      if (!routesResult.success) {
        return routesResult;
      }

      const routes = routesResult.data;

      // Step 2: Initialize the result maps
      const reachableStations = new Map<string, StationId[]>();
      const visitedRoutes = new Set<string>();
      const visitedStations = new Set<string>();

      // Add directly reachable stations (transfer = 0)
      const directlyReachable = this.getDirectlyReachableStations(
        query.origin,
        routes
      );
      reachableStations.set("0", directlyReachable);
      directlyReachable.forEach((station) => {
        visitedStations.add(station.toString());
      });

      routes.forEach((route) => {
        visitedRoutes.add(route.id.toString());
      });

      // If max transfers is 0, we're done
      if (query.maxTransfers === 0) {
        return success(
          new ReachabilityResult(query.origin, 0, reachableStations, routes)
        );
      }

      // Step 3: Perform BFS for transfers
      let currentTransfer = 0;
      let currentStations = directlyReachable;

      while (currentTransfer < query.maxTransfers) {
        currentTransfer += 1;
        const nextReachable: StationId[] = [];

        // For each station at the current transfer level
        for (const station of currentStations) {
          // Skip if we've already processed this station (avoid cycles)
          if (station.toString() === query.origin.toString()) {
            continue;
          }

          // Get all routes for this station
          // NOTE: In a real implementation, we would likely have this data preloaded
          // For now, we're making API calls for each station which is inefficient
          const stationRoutesResult =
            await this.routeService.getRoutesByStation(station);

          if (!stationRoutesResult.success) {
            continue;
          }

          const stationRoutes = stationRoutesResult.data;

          for (const route of stationRoutes) {
            // Skip already visited routes
            if (visitedRoutes.has(route.id.toString())) {
              continue;
            }

            visitedRoutes.add(route.id.toString());

            // Add all stops on this route
            for (const stop of route.stops) {
              if (
                !visitedStations.has(stop.toString()) &&
                stop.toString() !== query.origin.toString()
              ) {
                nextReachable.push(stop);
                visitedStations.add(stop.toString());
              }
            }
          }
        }

        if (nextReachable.length > 0) {
          reachableStations.set(currentTransfer.toString(), nextReachable);
        }

        currentStations = nextReachable;

        // If no more stations to process, break
        if (currentStations.length === 0) {
          break;
        }
      }

      // Create final result
      return success(
        new ReachabilityResult(
          query.origin,
          currentTransfer,
          reachableStations,
          // In a real implementation, we would track all connected routes
          routes
        )
      );
    } catch (error) {
      return failure(
        new Error(`Failed to calculate reachable stations: ${error}`)
      );
    }
  }

  private getDirectlyReachableStations(
    origin: StationId,
    routes: Route[]
  ): StationId[] {
    const reachable = new Set<string>();
    const result: StationId[] = [];

    for (const route of routes) {
      for (const stop of route.stops) {
        const stopId = stop.toString();

        // Don't include the origin station
        if (stopId !== origin.toString() && !reachable.has(stopId)) {
          reachable.add(stopId);
          result.push(stop);
        }
      }
    }

    return result;
  }
}
