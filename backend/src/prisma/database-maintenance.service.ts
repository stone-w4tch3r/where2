import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import { CronJob } from "cron";

@Injectable()
export class DatabaseMaintenanceService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseMaintenanceService.name);
  private readonly isMaintenanceEnabled: boolean;
  private readonly maintenanceCronSchedule: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    // Get configuration from environment variables
    this.isMaintenanceEnabled =
      this.configService.get<string>("DB_MAINTENANCE_ENABLED") === "true";
    this.maintenanceCronSchedule =
      this.configService.get<string>("DB_MAINTENANCE_CRON") || undefined;

    if (this.isMaintenanceEnabled) {
      this.logger.log(
        `Database maintenance is enabled with schedule: ${this.maintenanceCronSchedule}`,
      );
    } else {
      this.logger.log("Automatic database maintenance is disabled");
    }
  }

  /**
   * Set up the cron job with the schedule from the environment variable
   */
  async onModuleInit() {
    if (this.isMaintenanceEnabled && this.maintenanceCronSchedule) {
      // Create a cron job with the schedule from the environment variable
      const job = new CronJob(this.maintenanceCronSchedule, () => {
        this.performMaintenance();
      });

      // Register the cron job with a name
      this.schedulerRegistry.addCronJob("database-maintenance", job);

      // Start the job
      job.start();
      this.logger.log(
        `Scheduled database maintenance with cron: ${this.maintenanceCronSchedule}`,
      );
    }
  }

  /**
   * Run PostgreSQL maintenance operations - VACUUM, ANALYZE, and REINDEX
   * This should be called periodically via a scheduler
   */
  async performMaintenance(): Promise<boolean> {
    this.logger.log("Starting database maintenance tasks");

    try {
      // Run VACUUM to clean up dead tuples and reclaim storage
      await this.prisma.$executeRawUnsafe("VACUUM");
      this.logger.log("VACUUM completed successfully");

      // Run ANALYZE to update statistics for the query planner
      await this.prisma.$executeRawUnsafe("ANALYZE");
      this.logger.log("ANALYZE completed successfully");

      // REINDEX to rebuild indexes which can become fragmented
      await this.prisma.$executeRawUnsafe(
        "REINDEX DATABASE CONCURRENTLY current_database()",
      );
      this.logger.log("REINDEX completed successfully");

      return true;
    } catch (error) {
      this.logger.error("Database maintenance failed:", error);
      return false;
    }
  }
}
