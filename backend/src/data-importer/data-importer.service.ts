import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { YandexService } from "../yandex/yandex.service";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { ConfigService } from "@nestjs/config";
import { Result, resultSuccess, resultError } from "../utils/Result";
import { InternalError } from "../utils/errors";
import { AppError } from "../utils/errors";
import { TransportMode } from "../shared/dto/transport-mode.dto";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";

const REGION = "Свердловская область";

@Injectable()
export class DataImporterService implements OnModuleInit {
  private readonly logger = new Logger(DataImporterService.name);
  private readonly isImportEnabled: boolean;
  private readonly importCronSchedule: string | undefined;

  constructor(
    private readonly yandexService: YandexService,
    private readonly stationOrm: StationOrmService,
    private readonly routeOrm: RouteOrmService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.isImportEnabled =
      this.configService.get<string>("DATA_IMPORT_ENABLED") === "true";
    this.importCronSchedule =
      this.configService.get<string>("DATA_IMPORT_CRON") || undefined;

    if (this.isImportEnabled) {
      this.logger.log(
        `Data import is enabled with schedule: ${this.importCronSchedule || "not specified"}`,
      );
    } else {
      this.logger.log("Automatic data import is disabled");
    }
  }

  async onModuleInit() {
    if (this.isImportEnabled && this.importCronSchedule) {
      // Create a cron job with the schedule from the environment variable
      const job = new CronJob(this.importCronSchedule, () => {
        this.handleDailyDataImport();
      });

      // Register the cron job with a name
      this.schedulerRegistry.addCronJob("data-import", job);

      // Start the job
      job.start();
      this.logger.log(
        `Scheduled data import with cron: ${this.importCronSchedule}`,
      );
    }
  }

  async handleDailyDataImport() {
    try {
      this.logger.log("Running daily data import");
      const result = await this.importAllData();

      if (result.success) {
        this.logger.log(`Data import completed successfully: ${result.data}`);
      } else {
        this.logger.error(`Data import failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error("Error during data import", error);
    }
  }

  /**
   * Import all stations in a region and their routes
   */
  async importAllData(): Promise<Result<string, AppError>> {
    this.logger.log("Starting data import...");
    // Step 1: Get all stations
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

    this.logger.log(`Found ${stationsResponse.stations.length} stations total`);

    // Step 2: Save stations to database
    // Note: we need to save ALL, not only REGION
    this.logger.log("Saving stations to database...");
    const stations = stationsResponse.stations.map((station) => ({
      id: station.codes.yandex_code,
      fullName: station.title,
      popularName: null, // TODO REMOVE THIS PROPERTY LATER
      shortName: null, // TODO REMOVE THIS PROPERTY LATER
      transportMode: station.transport_type,
      latitude: station.latitude === "" ? null : station.latitude,
      longitude: station.longitude === "" ? null : station.longitude,
      country: station.country,
      region: station.region,
    }));
    await this.stationOrm.upsertStations(stations);

    this.logger.log("All stations saved to database");
    // throw new Error("Stop here");

    // Filter stations for REGION
    const filteredStations = stationsResponse.stations.filter(
      (station) => station.region === REGION,
    );

    this.logger.log(
      `Found ${filteredStations.length} stations in ${REGION} region`,
    );

    // Step 3: For each station, get schedules to extract threads
    const importedThreads = new Set<string>();
    let routeCount = 0;

    for (const yandexStation of filteredStations) {
      routeCount++;
      const progress = (routeCount / filteredStations.length) * 100;
      this.logger.log(
        `Importing station ${routeCount}/${filteredStations.length} (${progress.toFixed(
          2,
        )}%)`,
      );

      const stationId = yandexStation.codes.yandex_code;

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
      const threads = scheduleData.schedule;

      // Import each thread (route)
      for (const item of threads) {
        const thread = item.thread;
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
        const stopIds = threadData.stops.map((stop) => stop.station.code);

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
      }
    }

    this.logger.log(
      `Imported ${routeCount} routes from ${importedThreads.size} threads`,
    );

    return resultSuccess(
      `Successfully imported ${filteredStations.length} stations and ${routeCount} routes`,
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
