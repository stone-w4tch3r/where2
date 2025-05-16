import { YandexRaspClient } from "../yandex/client";
import { DatabaseService } from "./DatabaseService";
import { Station, StationId, TransportMode } from "../models/Station";
import { Route, RouteId } from "../models/Route";
import { Result, success, failure } from "../utils/Result";
import { YandexStation } from "../yandex/schemas";

/**
 * Service for batch processing and importing data from Yandex API to the database
 * Follows the data flow in the documentation:
 * 1. Fetch stations list, filtered by region
 * 2. For each station, fetch schedules to get thread UIDs
 * 3. For each thread, fetch full route information
 * 4. Save everything to database
 */
export class DataProcessor {
  constructor(
    private readonly yandexClient: YandexRaspClient,
    private readonly dbService: DatabaseService
  ) {}

  /**
   * Process all stations in Sverdlovsk region and their routes
   */
  async processAllData(): Promise<Result<string>> {
    try {
      console.log("Starting data processing...");

      // Step 1: Get stations in Sverdlovsk region
      const stationsResult = await this.yandexClient.getStationsList({
        lang: "ru_RU",
        format: "json",
      });

      if (!stationsResult.success) {
        return failure(
          new Error(`Failed to fetch stations: ${stationsResult.error}`)
        );
      }

      // Filter stations for Sverdlovsk region
      const sverdlovskStations = stationsResult.data.stations.filter(
        (station: YandexStation) => station.region === "Свердловская область"
      );

      console.log(
        `Found ${sverdlovskStations.length} stations in Sverdlovsk region`
      );

      // Step 2: Save stations to database
      for (const yandexStation of sverdlovskStations) {
        const station = Station.fromYandexStation(yandexStation);
        await this.dbService.saveStation(station);
      }

      console.log("All stations saved to database");

      // Step 3: For each station, get schedules to extract threads
      const processedThreads = new Set<string>();
      let routeCount = 0;

      for (const yandexStation of sverdlovskStations) {
        const stationId = yandexStation.code;

        // Get station schedule
        const scheduleResult = await this.yandexClient.getStationSchedule({
          station: stationId,
        });

        if (!scheduleResult.success) {
          console.error(
            `Failed to fetch schedule for station ${stationId}: ${scheduleResult.error}`
          );
          continue;
        }

        // Extract thread UIDs from schedule
        const threads = scheduleResult.data.schedule.map((item) => item.thread);

        // Process each thread (route)
        for (const thread of threads) {
          const threadUid = thread.uid;

          // Skip if we've already processed this thread
          if (processedThreads.has(threadUid)) {
            continue;
          }

          // Mark as processed
          processedThreads.add(threadUid);

          // Get thread stations
          const threadResult = await this.yandexClient.getThreadStations({
            uid: threadUid,
          });

          if (!threadResult.success) {
            console.error(
              `Failed to fetch thread ${threadUid}: ${threadResult.error}`
            );
            continue;
          }

          // Extract route stops
          const stopIds = threadResult.data.stops.map((stop) =>
            StationId.fromYandexCode(stop.station.code)
          );

          const transportType = this.mapTransportType(thread.transport_type);

          // Create route with proper URL from thread_method_link
          const route = new Route(
            RouteId.fromYandexThreadUid(thread.uid),
            thread.number,
            thread.title,
            transportType,
            stopIds,
            thread.thread_method_link || null
          );

          // Save route to database
          await this.dbService.saveRoute(route);
          routeCount++;
        }
      }

      console.log(
        `Processed ${routeCount} routes from ${processedThreads.size} threads`
      );

      return success(
        `Successfully processed ${sverdlovskStations.length} stations and ${routeCount} routes`
      );
    } catch (error) {
      console.error("Error in data processing:", error);
      return failure(new Error(`Error in data processing: ${error}`));
    }
  }

  /**
   * Maps Yandex transport_type to our TransportMode enum
   */
  private mapTransportType(transportType: string): TransportMode {
    switch (transportType) {
      case "train":
        return TransportMode.Train;
      case "suburban":
        return TransportMode.Suburban;
      case "bus":
        return TransportMode.Bus;
      case "tram":
        return TransportMode.Tram;
      case "metro":
        return TransportMode.Metro;
      case "water":
        return TransportMode.Water;
      case "helicopter":
        return TransportMode.Helicopter;
      case "plane":
        return TransportMode.Plane;
      default:
        return TransportMode.Train; // Default to train
    }
  }
}
