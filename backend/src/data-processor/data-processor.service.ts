import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { YandexService } from "../yandex/yandex.service";
import { YandexStation } from "../yandex/entities/yandex-schemas";

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
export class DataProcessorService {
  private readonly logger = new Logger(DataProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yandexService: YandexService
  ) {}

  @Cron("0 0 * * *") // Run daily at midnight
  async handleDailyDataProcessing() {
    this.logger.log("Running daily data processing");
    await this.processAllData();
  }

  /**
   * Process all stations in Sverdlovsk region and their routes
   */
  async processAllData(): Promise<string> {
    try {
      this.logger.log("Starting data processing...");

      // Step 1: Get stations in Sverdlovsk region
      const stationsResponse = await this.yandexService.getStationsList();

      // Filter stations for Sverdlovsk region
      const sverdlovskStations = stationsResponse.stations.filter(
        (station: YandexStation) => station.region === "Свердловская область"
      );

      this.logger.log(
        `Found ${sverdlovskStations.length} stations in Sverdlovsk region`
      );

      // Step 2: Save stations to database
      for (const yandexStation of sverdlovskStations) {
        await this.prisma.station.upsert({
          where: { id: yandexStation.code },
          update: {
            fullName: yandexStation.title,
            transportMode: yandexStation.transport_type,
            latitude: yandexStation.latitude,
            longitude: yandexStation.longitude,
            country: yandexStation.country,
            region: yandexStation.region,
          },
          create: {
            id: yandexStation.code,
            fullName: yandexStation.title,
            transportMode: yandexStation.transport_type,
            latitude: yandexStation.latitude,
            longitude: yandexStation.longitude,
            country: yandexStation.country,
            region: yandexStation.region,
          },
        });
      }

      this.logger.log("All stations saved to database");

      // Step 3: For each station, get schedules to extract threads
      const processedThreads = new Set<string>();
      let routeCount = 0;

      for (const yandexStation of sverdlovskStations) {
        const stationId = yandexStation.code;

        try {
          // Get station schedule
          const scheduleData = await this.yandexService.getStationSchedule({
            station: stationId,
          });

          // Extract thread UIDs from schedule
          const threads = scheduleData.schedule.map((item) => item.thread);

          // Process each thread (route)
          for (const thread of threads) {
            const threadUid = thread.uid;

            // Skip if we've already processed this thread
            if (processedThreads.has(threadUid)) {
              continue;
            }

            // Mark as processed
            processedThreads.add(threadUid);

            try {
              // Get thread stations
              const threadData = await this.yandexService.getThreadStations({
                uid: threadUid,
              });

              // Extract route stops
              const stopIds = threadData.stops.map((stop) => stop.station.code);

              const transportType = this.mapTransportType(
                thread.transport_type
              );

              // Start a transaction to save route and its stops
              await this.prisma.$transaction(async (tx) => {
                // Save the route
                await tx.route.upsert({
                  where: { id: threadUid },
                  update: {
                    shortTitle: thread.number,
                    fullTitle: thread.title,
                    transportMode: transportType,
                    routeInfoUrl: thread.thread_method_link || null,
                  },
                  create: {
                    id: threadUid,
                    shortTitle: thread.number,
                    fullTitle: thread.title,
                    transportMode: transportType,
                    routeInfoUrl: thread.thread_method_link || null,
                  },
                });

                // Delete existing route stops
                await tx.routeStop.deleteMany({
                  where: { routeId: threadUid },
                });

                // Add new route stops
                for (let i = 0; i < stopIds.length; i++) {
                  await tx.routeStop.create({
                    data: {
                      routeId: threadUid,
                      stationId: stopIds[i],
                      stopPosition: i,
                    },
                  });
                }
              });

              routeCount++;
            } catch (threadError) {
              this.logger.error(
                `Failed to fetch thread ${threadUid}: ${threadError}`
              );
              continue;
            }
          }
        } catch (scheduleError) {
          this.logger.error(
            `Failed to fetch schedule for station ${stationId}: ${scheduleError}`
          );
          continue;
        }
      }

      this.logger.log(
        `Processed ${routeCount} routes from ${processedThreads.size} threads`
      );

      return `Successfully processed ${sverdlovskStations.length} stations and ${routeCount} routes`;
    } catch (error) {
      this.logger.error("Error in data processing:", error);
      throw new Error(`Error in data processing: ${error}`);
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
