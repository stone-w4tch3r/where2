import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import pLimit from "p-limit";
import { StationWithRegion, YandexService } from "../yandex/yandex.service";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { ConfigService } from "@nestjs/config";
import {
  StationTransportType,
  ThreadTransportType,
} from "../yandex/baseSchemas";
import { TransportMode } from "../shared/transport-mode.dto";
import { Result, resultError, resultSuccess } from "../utils/Result";
import { AppError, InternalError } from "../utils/errors";
import { getErrorMessage } from "../utils/errorHelpers";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const COUNTRIES = ["Россия"]; // Allowed country list
const STATION_TRANSPORT_TYPES: StationTransportType[] = [
  "suburban",
  "train",
  "plane",
];
const THREAD_TRANSPORT_TYPES: ThreadTransportType[] = ["suburban"];

const STATION_CONCURRENCY_LIMIT_DEFAULT = 40;
const THREAD_CONCURRENCY_LIMIT_DEFAULT = 80;

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

@Injectable()
export class DataImporterService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DataImporterService.name);
  private readonly isImportEnabled: boolean;
  private readonly importCronSchedule?: string;
  private readonly stationConcurrencyLimit: number;
  private readonly threadConcurrencyLimit: number;

  /**
   * Tracks whether NestJS is shutting down so that long-running tasks
   * can attempt a graceful early exit.
   */
  private isShuttingDown = false;
  private isCancelled = false;

  constructor(
    private readonly yandex: YandexService,
    private readonly stationOrm: StationOrmService,
    private readonly routeOrm: RouteOrmService,
    private readonly cfg: ConfigService,
    private readonly scheduler: SchedulerRegistry,
  ) {
    // -----------------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------------
    this.isImportEnabled =
      this.cfg.get<string>("DATA_IMPORT_ENABLED") === "true";
    this.importCronSchedule =
      this.cfg.get<string>("DATA_IMPORT_CRON") ?? undefined;

    this.stationConcurrencyLimit = this.getNumericCfg(
      "DATA_IMPORT_STATION_CONCURRENCY",
      STATION_CONCURRENCY_LIMIT_DEFAULT,
    );
    this.threadConcurrencyLimit = this.getNumericCfg(
      "DATA_IMPORT_THREAD_CONCURRENCY",
      THREAD_CONCURRENCY_LIMIT_DEFAULT,
    );

    // -----------------------------------------------------------------------
    // Logging startup state
    // -----------------------------------------------------------------------
    if (this.isImportEnabled) {
      this.logger.log(
        `Data import enabled (cron: ${this.importCronSchedule ?? "manual"})`,
      );
    } else {
      this.logger.log("Automatic data import disabled");
    }
  }

  // ---------------------------------------------------------------------------
  // Nest lifecycle hooks
  // ---------------------------------------------------------------------------

  async onModuleInit(): Promise<void> {
    if (!this.isImportEnabled || !this.importCronSchedule) return;

    const job = new CronJob(this.importCronSchedule, () =>
      this.handleDailyImport().catch((err) =>
        this.logger.error("Unhandled import error", err),
      ),
    );

    this.scheduler.addCronJob("data-import", job);
    job.start();

    this.logger.log(
      `Scheduled data import via cron (${this.importCronSchedule})`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Shutting down DataImporterService");
    this.isShuttingDown = true;

    try {
      this.scheduler.getCronJob("data-import")?.stop();
      this.logger.log("Cron job stopped");
    } catch (err) {
      this.logger.warn("Failed to stop cron job or cron job not found");
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Manual trigger (or cron callback).
   */
  async handleDailyImport(): Promise<void> {
    const res = await this.importAllData();
    if (res.success) {
      this.logger.log(res.data);
    } else {
      this.logger.error(res.error);
    }
  }

  /**
   * High-level orchestration.  Catch-all for converting thrown errors into
   * typed Result objects.
   */
  async importAllData(): Promise<Result<string, AppError>> {
    this.logger.log(
      `--- Import started (station=${this.stationConcurrencyLimit}; thread=${this.threadConcurrencyLimit}) ---`,
    );

    try {
      // 1. Fetch + persist stations ------------------------------------------------
      const stations = await this.fetchAndPersistStations();

      // 2. Import routes (threads) --------------------------------------------------
      const routeCount = await this.importRoutes(stations);

      return resultSuccess(
        `Successfully imported ${stations.length} stations and ${routeCount} routes`,
      );
    } catch (err) {
      this.isCancelled = true;
      const appErr =
        err instanceof AppError ? err : new InternalError(getErrorMessage(err));
      this.logger.error("IMPORT CANCELLED: " + appErr);
      return resultError(appErr);
    } finally {
      this.logger.log("Import finished (cancelled=" + this.isCancelled + ")");
    }
  }

  // ---------------------------------------------------------------------------
  // Step 1: Stations
  // ---------------------------------------------------------------------------

  private async fetchAndPersistStations(): Promise<StationWithRegion[]> {
    const stationsRes = await this.yandex.getStationsList();
    if (!stationsRes.success) {
      throw new InternalError(
        `Unable to fetch station list: ${stationsRes.error}`,
      );
    }

    const stations = stationsRes.data.stations.filter((s) =>
      STATION_TRANSPORT_TYPES.includes(s.transport_type),
    );

    // Persist (upsert)
    await this.stationOrm.upsertStations(
      stations.map((s) => ({
        id: s.codes.yandex_code,
        fullName: s.title,
        transportMode: this.mapTransportType(s.transport_type),
        latitude: s.latitude || null,
        longitude: s.longitude || null,
        country: s.country,
        region: s.region,
      })),
    );

    // Filter by allowed countries for the next step
    return stations.filter((s) => COUNTRIES.includes(s.country));
  }

  // ---------------------------------------------------------------------------
  // Step 2: Routes / Threads
  // ---------------------------------------------------------------------------

  private async importRoutes(stations: StationWithRegion[]): Promise<number> {
    const importedThreads = new Set<string>();
    let routeCount = 0;
    let stationsProcessed = 0; // Counter for processed stations
    const totalStations = stations.length; // Total number of stations

    const stationLimit = pLimit(this.stationConcurrencyLimit);
    const threadLimit = pLimit(this.threadConcurrencyLimit);

    await Promise.all(
      stations.map((station) =>
        stationLimit(async () => {
          if (this.isShuttingDown || this.isCancelled) return;

          stationsProcessed++;
          const progressPercent =
            totalStations > 0
              ? ((stationsProcessed / totalStations) * 100).toFixed(2)
              : "0.00";
          this.logger.debug(
            `Processing station ${stationsProcessed}/${totalStations} (${progressPercent}%) - ${station.codes.yandex_code} - ${station.title}`,
          );

          // Fetch schedule ------------------------------------------------------
          const scheduleRes = await this.yandex.getStationSchedule({
            station: station.codes.yandex_code,
          });
          if (this.isShuttingDown || this.isCancelled) return;
          if (!scheduleRes.success) {
            this.logger.verbose(
              `Schedule fetch failed for station ${station.codes.yandex_code}: ${scheduleRes.error}`,
            ); // This happens often
            return;
          }

          const threads = scheduleRes.data.schedule.filter((t) =>
            THREAD_TRANSPORT_TYPES.includes(t.thread.transport_type),
          );

          await Promise.all(
            threads.map((item) =>
              threadLimit(async () => {
                if (this.isShuttingDown || this.isCancelled) return;

                const t = item.thread;
                if (importedThreads.has(t.uid)) return;
                importedThreads.add(t.uid);

                // Fetch full thread info -------------------------------------
                const threadRes = await this.yandex.getThreadStations({
                  uid: t.uid,
                });
                if (this.isShuttingDown || this.isCancelled) return;
                if (!threadRes.success) {
                  this.logger.verbose(
                    `Thread fetch failed for station ${station.codes.yandex_code}, thread ${t.uid}: ${threadRes.error}`,
                  ); // This happens often
                  return;
                }

                // Persist route ----------------------------------------------
                await this.routeOrm.upsertRouteWithStops({
                  threadUid: t.uid,
                  shortTitle: t.number,
                  fullTitle: t.title,
                  transportType: this.mapTransportType(t.transport_type),
                  routeInfoUrl: t.thread_method_link ?? null,
                  stopIds: threadRes.data.stops.map((s) => s.station.code),
                });
                routeCount += 1;
              }),
            ),
          );
        }),
      ),
    );

    return routeCount;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private getNumericCfg(key: string, def: number): number {
    const val = this.cfg.get<string>(key);
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : def;
  }

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
