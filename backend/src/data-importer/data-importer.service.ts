import { Injectable, Logger } from "@nestjs/common";
import { YandexService } from "../yandex/yandex.service";
import { YandexStation, ScheduleItem } from "../yandex/entities/yandex-schemas";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { ConfigService } from "@nestjs/config";
import { Result, resultSuccess, resultError } from "../utils/Result";
import { InternalError } from "../utils/errors";
import { AppError } from "../utils/errors";

enum TransportMode {
  Train = "train",
  Suburban = "suburban",
  Bus = "bus",
  Tram = "tram",
  Metro = "metro",
  Water = "water",
  Helicopter = "helicopter",
  Plane = "plane",
}

@Injectable()
export class DataImporterService {
  private readonly logger = new Logger(DataImporterService.name);

  constructor(
    private readonly yandexService: YandexService,
    private readonly stationOrm: StationOrmService,
    private readonly routeOrm: RouteOrmService,
    private readonly configService: ConfigService,
  ) {}

  private cronJob: (() => void) | null = null;

  onModuleInit() {
    const cron = this.configService.get<string>("DATA_IMPORT_CRON") || "";
    const enabled =
      this.configService.get<string>("DATA_IMPORT_ENABLED") === "true" &&
      cron !== "";
    if (enabled) {
      throw new Error(
        "Schedule module is not properly injected. Please refactor to use dependency injection for scheduling.",
      );
    }
  }

  async handleDailyDataImport() {
    this.logger.log("Running daily data import");
    await this.importAllData();
  }

  /**
   * Import all stations in Sverdlovsk region and their routes
   */
  async importAllData(): Promise<Result<string, AppError>> {
    this.logger.log("Starting data import...");
    // Step 1: Get stations in Sverdlovsk region
    const stationsResponseResult = await this.yandexService.getStationsList();
    if (!stationsResponseResult.success) {
      this.logger.error(
        "Error fetching stations list:",
        stationsResponseResult.error,
      );
      return resultError(
        new InternalError(
          `Error fetching stations list: ${stationsResponseResult.error}`,
        ),
      );
    }
    const stationsResponse = stationsResponseResult.data;

    // Filter stations for Sverdlovsk region
    const sverdlovskStations = stationsResponse.stations.filter(
      (station: YandexStation) => station.region === "Свердловская область",
    );

    this.logger.log(
      `Found ${sverdlovskStations.length} stations in Sverdlovsk region`,
    );

    // Step 2: Save stations to database
    for (const yandexStation of sverdlovskStations) {
      await this.stationOrm.upsertStation({
        id: yandexStation.code,
        fullName: yandexStation.title,
        transportMode: yandexStation.transport_type,
        latitude: yandexStation.latitude,
        longitude: yandexStation.longitude,
        country: yandexStation.country ?? "",
        region: yandexStation.region ?? "",
      });
    }

    this.logger.log("All stations saved to database");

    // Step 3: For each station, get schedules to extract threads
    const importedThreads = new Set<string>();
    let routeCount = 0;

    for (const yandexStation of sverdlovskStations) {
      const stationId = yandexStation.code;

      const scheduleResult = await this.yandexService.getStationSchedule({
        station: stationId,
      });
      if (!scheduleResult.success) {
        this.logger.error(
          `Failed to fetch schedule for station ${stationId}: ${scheduleResult.error}`,
        );
        continue;
      }
      const scheduleData = scheduleResult.data;

      // Extract thread UIDs from schedule
      const threads = scheduleData.schedule.map(
        (item: ScheduleItem) => item.thread,
      );

      // Import each thread (route)
      for (const thread of threads) {
        const threadUid = thread.uid;

        // Skip if we've already imported this thread
        if (importedThreads.has(threadUid)) {
          continue;
        }

        // Mark as imported
        importedThreads.add(threadUid);

        const threadResult = await this.yandexService.getThreadStations({
          uid: threadUid,
        });
        if (!threadResult.success) {
          this.logger.error(
            `Failed to fetch thread ${threadUid}: ${threadResult.error}`,
          );
          continue;
        }
        const threadData = threadResult.data;

        // Extract route stops
        const stopIds = threadData.stops.map(
          (stop: { station: { code: string } }) => stop.station.code,
        );

        const transportType = this.mapTransportType(thread.transport_type);

        // Start a transaction to save route and its stops
        await this.routeOrm.upsertRouteWithStops({
          threadUid,
          shortTitle: thread.number,
          fullTitle: thread.title,
          transportType,
          routeInfoUrl: thread.thread_method_link || null,
          stopIds,
        });

        routeCount++;
      }
    }

    this.logger.log(
      `Imported ${routeCount} routes from ${importedThreads.size} threads`,
    );

    return resultSuccess(
      `Successfully imported ${sverdlovskStations.length} stations and ${routeCount} routes`,
    );
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
