import { Route, RouteId } from "../models/Route";
import { StationId } from "../models/Station";
import { YandexRaspClient } from "../yandex/client";
import { Result, success, failure } from "../utils/Result";
import { ScheduleItem } from "../yandex/schemas";

export class RouteService {
  constructor(private readonly yandexClient: YandexRaspClient) {}

  async getRoutesByStation(stationId: StationId): Promise<Result<Route[]>> {
    try {
      // Get schedule to extract thread UIDs
      const scheduleResult = await this.yandexClient.getStationSchedule({
        station: stationId.toString(),
      });

      if (!scheduleResult.success) {
        return failure(new Error(scheduleResult.error));
      }

      const threads = scheduleResult.data.schedule.map(
        (item: ScheduleItem) => item.thread
      );
      const uniqueThreads = this.removeDuplicateThreads(threads);

      // For each thread, get its stops
      const routesPromises = uniqueThreads.map(async (thread) => {
        const threadResult = await this.yandexClient.getThreadStations({
          uid: thread.uid,
        });

        if (!threadResult.success) {
          return null;
        }

        const stopIds = threadResult.data.stops.map((stop: any) =>
          StationId.fromYandexCode(stop.station.code)
        );

        return Route.fromYandexThread(thread, stopIds);
      });

      const routes = (await Promise.all(routesPromises)).filter(
        (r): r is Route => r !== null
      );
      return success(routes);
    } catch (error) {
      return failure(new Error(`Failed to fetch routes: ${error}`));
    }
  }

  async getRouteById(_routeId: RouteId): Promise<Result<Route>> {
    try {
      // In a real app, this would query a database
      // Since we don't have a direct API to fetch a route by ID,
      // this is a placeholder implementation
      return failure(new Error("Not implemented"));
    } catch (error) {
      return failure(new Error(`Failed to fetch route: ${error}`));
    }
  }

  private removeDuplicateThreads(threads: any[]): any[] {
    const uniqueThreads = new Map();
    for (const thread of threads) {
      if (!uniqueThreads.has(thread.uid)) {
        uniqueThreads.set(thread.uid, thread);
      }
    }
    return Array.from(uniqueThreads.values());
  }
}
