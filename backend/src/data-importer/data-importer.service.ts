import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { YandexService } from "../yandex/yandex.service";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { ConfigService } from "@nestjs/config";
import { Result, resultSuccess, resultError } from "../utils/Result";
import { InternalError } from "../utils/errors";
import { AppError } from "../utils/errors";
import { TransportMode } from "../shared/transport-mode.dto";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import pLimit from "p-limit";
import {
  StationTransportType,
  ThreadTransportType,
} from "../yandex/baseSchemas";

const COUNTRIES = ["Россия"];
const STATION_TRANSPORT_TYPES: StationTransportType[] = [
  "suburban",
  "train",
  "plane",
];
const THREAD_TRANSPORT_TYPES: ThreadTransportType[] = ["suburban"];

const STATION_CONCURRENCY_LIMIT_DEFAULT = 40;
const THREAD_CONCURRENCY_LIMIT_DEFAULT = 80;

@Injectable()
export class DataImporterService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DataImporterService.name);
  private readonly isImportEnabled: boolean;
  private readonly importCronSchedule: string | undefined;
  private readonly stationConcurrencyLimit: number;
  private readonly threadConcurrencyLimit: number;
  private isShuttingDown = false;

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

    // Initialize concurrency limits from config, with defaults
    const stationConcurrencyEnv = this.configService.get<string>(
      "DATA_IMPORT_STATION_CONCURRENCY",
    );
    this.stationConcurrencyLimit =
      stationConcurrencyEnv !== undefined && stationConcurrencyEnv !== null
        ? Number(stationConcurrencyEnv)
        : STATION_CONCURRENCY_LIMIT_DEFAULT;
    const threadConcurrencyEnv = this.configService.get<string>(
      "DATA_IMPORT_THREAD_CONCURRENCY",
    );
    this.threadConcurrencyLimit =
      threadConcurrencyEnv !== undefined && threadConcurrencyEnv !== null
        ? Number(threadConcurrencyEnv)
        : THREAD_CONCURRENCY_LIMIT_DEFAULT;

    if (this.isImportEnabled) {
      this.logger.log(
        `Data import is enabled with schedule: ${this.importCronSchedule || "not specified"}`,
      );
    } else {
      this.logger.log("Automatic data import is disabled");
    }
  }

  async onModuleInit(): Promise<void> {
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

  async onModuleDestroy(): Promise<void> {
    this.logger.log("DataImporterService is shutting down.");
    this.isShuttingDown = true;

    if (this.importCronSchedule) {
      try {
        const job = this.schedulerRegistry.getCronJob("data-import");
        if (job) {
          job.stop();
          this.logger.log("Data import cron job stopped.");
        }
      } catch (error) {
        this.logger.warn("Could not stop data import cron job.", error);
      }
    }
  }

  async handleDailyDataImport(): Promise<void> {
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
    this.logger.debug(
      `Concurrency limits: station=${this.stationConcurrencyLimit}, thread=${this.threadConcurrencyLimit}`,
    );

    let operationCancelled = false; // Flag for this specific import run

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

    const filteredByTypeStations = stationsResponse.stations.filter((station) =>
      STATION_TRANSPORT_TYPES.includes(station.transport_type),
    );

    this.logger.debug(`Found ${filteredByTypeStations.length} stations total`);

    // Step 2: Save stations to database
    this.logger.debug("Saving stations to database...");
    try {
      const stations = filteredByTypeStations.map((station) => ({
        id: station.codes.yandex_code,
        fullName: station.title,
        transportMode: this.mapTransportType(station.transport_type),
        latitude: station.latitude === "" ? null : station.latitude,
        longitude: station.longitude === "" ? null : station.longitude,
        country: station.country,
        region: station.region,
      }));
      await this.stationOrm.upsertStations(stations);
    } catch (error) {
      this.logger.error(
        "Critical error during initial station upsert. Aborting import.",
        error,
      );
      const message = error instanceof Error ? error.message : String(error);
      return resultError(
        new InternalError(
          `Critical error during initial station upsert: ${message}`,
        ),
      );
    }
    this.logger.debug("All stations saved to database");

    const filteredStations = stationsResponse.stations.filter(
      (station) =>
        COUNTRIES.includes(station.country) &&
        STATION_TRANSPORT_TYPES.includes(station.transport_type),
    );

    this.logger.debug(
      `Found ${filteredStations.length} stations in ${COUNTRIES.join(", ")}`,
    );

    const importedThreads = new Set<string>();
    let routeCount = 0;

    const stationLimit = pLimit(this.stationConcurrencyLimit);
    const threadLimit = pLimit(this.threadConcurrencyLimit);

    try {
      await Promise.all(
        filteredStations.map((yandexStation, idx) =>
          stationLimit(async () => {
            if (this.isShuttingDown || operationCancelled) {
              this.logger.verbose(
                `Station import task for ${yandexStation.codes.yandex_code} cancelled (shutdown: ${this.isShuttingDown}, operationCancelled: ${operationCancelled}).`,
              );
              return;
            }

            const progress = ((idx + 1) / filteredStations.length) * 100;
            this.logger.debug(
              `Importing station ${idx + 1}/${filteredStations.length} (${progress.toFixed(2)}%) - ${yandexStation.title}`,
            );
            const stationId = yandexStation.codes.yandex_code;

            try {
              const scheduleResult =
                await this.yandexService.getStationSchedule({
                  station: stationId,
                });

              if (this.isShuttingDown || operationCancelled) {
                // Re-check after await
                this.logger.verbose(
                  `Station import task for ${stationId} cancelled post-schedule fetch.`,
                );
                return;
              }

              if (!scheduleResult.success) {
                this.logger.verbose(
                  `Failed to fetch schedule for station ${stationId}: ${scheduleResult.error}. Skipping this station's threads.`,
                );
                // Quite popular error
                // Skip this station's threads, but don't cancel entire batch for this.
                return;
              }
              const threads = scheduleResult.data.schedule.filter((thread) =>
                THREAD_TRANSPORT_TYPES.includes(thread.thread.transport_type),
              );

              await Promise.all(
                threads.map((item) =>
                  threadLimit(async () => {
                    if (this.isShuttingDown || operationCancelled) {
                      this.logger.verbose(
                        `Thread import task for ${item.thread.uid} cancelled (shutdown: ${this.isShuttingDown}, operationCancelled: ${operationCancelled}).`,
                      );
                      return;
                    }
                    const thread = item.thread;
                    const threadUid = thread.uid;
                    if (importedThreads.has(threadUid)) return;

                    try {
                      importedThreads.add(threadUid); // Add earlier to avoid race conditions if this task gets cancelled mid-way

                      const threadResult =
                        await this.yandexService.getThreadStations({
                          uid: threadUid,
                        });

                      if (this.isShuttingDown || operationCancelled) {
                        // Re-check after await
                        this.logger.verbose(
                          `Thread import task for ${threadUid} cancelled post-thread fetch.`,
                        );
                        importedThreads.delete(threadUid); // Rollback if cancelled before DB op
                        return;
                      }

                      if (!threadResult.success) {
                        this.logger.error(
                          `Failed to fetch thread details for ${threadUid}: ${threadResult.error}. Skipping this thread.`,
                        );
                        importedThreads.delete(threadUid); // Rollback
                        return; // Skip this thread, but don't cancel entire batch for this specific error
                      }
                      const stopIds = threadResult.data.stops.map(
                        (stop) => stop.station.code,
                      );

                      await this.routeOrm.upsertRouteWithStops({
                        threadUid,
                        shortTitle: thread.number,
                        fullTitle: thread.title,
                        transportType: this.mapTransportType(
                          thread.transport_type,
                        ),
                        routeInfoUrl: thread.thread_method_link || null,
                        stopIds,
                      });
                      routeCount++;
                    } catch (error) {
                      this.logger.error(
                        `CRITICAL ERROR processing thread ${threadUid} for station ${stationId}. Setting cancellation flag. Error: ${error}`,
                      );
                      operationCancelled = true;
                      importedThreads.delete(threadUid); // Attempt to rollback from set
                      throw error; // Crucial: re-throw to reject threadLimit and propagate
                    }
                  }),
                ),
              );
            } catch (error) {
              // This catches errors from station-specific processing, including propagated thread errors
              // If not already cancelled, this error is the one triggering cancellation for other stations.
              if (!operationCancelled) {
                this.logger.error(
                  `CRITICAL ERROR processing station ${stationId}. Setting cancellation flag. Error: ${error}`,
                );
                operationCancelled = true;
              }
              throw error; // Crucial: re-throw to reject stationLimit and propagate to main Promise.all
            }
          }),
        ),
      );
    } catch (error) {
      // This catches the first CRITICAL error that caused a stationLimit promise to reject
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Data import process HALTED due to a critical error: ${message}. Some operations might have been cancelled.`,
        error,
      );
      return resultError(
        new InternalError(`Import process failed and was halted: ${message}`),
      );
    }

    if (this.isShuttingDown || operationCancelled) {
      this.logger.warn(
        `Import process was interrupted or cancelled. Imported ${routeCount} routes from ${importedThreads.size} threads before interruption.`,
      );
      return resultError(
        new InternalError(
          "Import process interrupted or cancelled before full completion.",
        ),
      );
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
      case "sea":
        return TransportMode.Sea;
      default:
        throw new InternalError(`Unknown transport type: ${transportType}`);
    }
  }
}
