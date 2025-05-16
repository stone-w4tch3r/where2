import cron from "node-cron";
import { DataProcessor } from "../services/DataProcessor";

type CronConfig = {
  schedule: string;
  timezone?: string;
  enabled: boolean;
};

export class CronJobManager {
  private dataProcessor: DataProcessor;
  private config: Record<string, CronConfig>;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(dataProcessor: DataProcessor) {
    this.dataProcessor = dataProcessor;
    this.config = {
      dataImport: {
        schedule: process.env.DATA_IMPORT_CRON ?? "",
        timezone: process.env.DATA_IMPORT_TIMEZONE ?? "",
        enabled: process.env.DATA_IMPORT_CRON !== undefined && process.env.DATA_IMPORT_ENABLED !== "false",
      },
    };
  }

  /**
   * Start all configured cron jobs
   */
  startAll(): void {
    this.startDataImportJob();
    console.log("All cron jobs started");
  }

  /**
   * Stop all running cron jobs
   */
  stopAll(): void {
    for (const [name, job] of this.jobs.entries()) {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    }
    this.jobs.clear();
  }

  /**
   * Start the data import cron job
   */
  private startDataImportJob(): void {
    const config = this.config.dataImport;

    if (!config.enabled) {
      console.log("Data import cron job is disabled by configuration");
      return;
    }

    try {
      const job = cron.schedule(
        config.schedule,
        async () => {
          console.log(
            `[${new Date().toISOString()}] Running scheduled data import...`
          );

          try {
            const result = await this.dataProcessor.processAllData();

            if (result.success) {
              console.log(`Data import completed successfully: ${result.data}`);
            } else {
              console.error(`Data import failed: ${result.error}`);
            }
          } catch (error) {
            console.error(
              "Unexpected error during scheduled data import:",
              error
            );
          }
        },
        {
          scheduled: true,
          timezone: config.timezone,
        }
      );

      this.jobs.set("dataImport", job);
      console.log(
        `Data import cron job scheduled: ${config.schedule} (${config.timezone})`
      );
    } catch (error) {
      console.error("Failed to schedule data import cron job:", error);
    }
  }
}
