/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { DataImporterService } from "./data-importer.service";
import { YandexService, StationWithRegion } from "../yandex/yandex.service";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import {
  StationTransportType,
  ThreadTransportType,
  StationContract,
  ThreadContract,
  StationListItemContract,
  ThreadStopContract,
} from "../yandex/baseSchemas";
import { StationScheduleResponse } from "../yandex/endpoints/stationSchedule";
import { ThreadStationsResponse } from "../yandex/endpoints/threadStations";
import { StationsListResponse } from "../yandex/endpoints/stationsList";
import { TransportMode } from "../shared/transport-mode.dto";
import { Result, resultError, resultSuccess } from "../utils/Result";
import { AppError, InternalError } from "../utils/errors";

// Mock implementations
const mockYandexService = {
  getStationsList: jest.fn(),
  getStationSchedule: jest.fn(),
  getThreadStations: jest.fn(),
};

const mockStationOrmService = {
  upsertStations: jest.fn(),
  findOne: jest.fn(),
};

const mockRouteOrmService = {
  upsertRouteWithStops: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockSchedulerRegistry = {
  addCronJob: jest.fn(),
  getCronJob: jest.fn(() => ({ stop: jest.fn() })), // Basic mock for CronJob
};

async function buildModule(
  configValues: Record<string, string | undefined> = {},
): Promise<TestingModule> {
  // Reset mocks for each test
  jest.clearAllMocks();

  // Default config values
  mockConfigService.get.mockImplementation((key: string) => {
    if (key === "DATA_IMPORT_ENABLED") return configValues[key] ?? "true";
    if (key === "DATA_IMPORT_CRON") return configValues[key] ?? undefined;
    if (key === "DATA_IMPORT_STATION_CONCURRENCY")
      return configValues[key] ?? "1";
    if (key === "DATA_IMPORT_THREAD_CONCURRENCY")
      return configValues[key] ?? "1";
    return undefined;
  });

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      DataImporterService,
      { provide: YandexService, useValue: mockYandexService },
      { provide: StationOrmService, useValue: mockStationOrmService },
      { provide: RouteOrmService, useValue: mockRouteOrmService },
      { provide: ConfigService, useValue: mockConfigService },
      { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
    ],
  }).compile();

  return module;
}

describe("DataImporterService", () => {
  let service: DataImporterService;
  let module: TestingModule;

  // Add this afterEach hook to close the module
  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  // ---------------------------------------------------------------------------
  // Test Data Helpers
  // ---------------------------------------------------------------------------

  // We'll add more specific helpers as needed for station/route data later

  // ---------------------------------------------------------------------------
  // Initialization and Configuration Tests
  // ---------------------------------------------------------------------------
  describe("Initialization and Configuration", () => {
    it("should be defined when module is built", async () => {
      module = await buildModule();
      service = module.get<DataImporterService>(DataImporterService);
      expect(service).toBeDefined();
    });

    it("should enable import if DATA_IMPORT_ENABLED is true", async () => {
      module = await buildModule({ DATA_IMPORT_ENABLED: "true" });
      service = module.get<DataImporterService>(DataImporterService);
      // Access private member for testing - this is a common pattern in Jest
      expect((service as any).isImportEnabled).toBe(true);
    });

    it("should disable import if DATA_IMPORT_ENABLED is false", async () => {
      module = await buildModule({ DATA_IMPORT_ENABLED: "false" });
      service = module.get<DataImporterService>(DataImporterService);
      expect((service as any).isImportEnabled).toBe(false);
    });

    it("should set cron schedule if DATA_IMPORT_CRON is provided", async () => {
      const cronValue = "0 0 * * *";
      module = await buildModule({ DATA_IMPORT_CRON: cronValue });
      service = module.get<DataImporterService>(DataImporterService);
      expect((service as any).importCronSchedule).toBe(cronValue);
    });

    it("should have undefined cron schedule if DATA_IMPORT_CRON is not provided", async () => {
      module = await buildModule();
      service = module.get<DataImporterService>(DataImporterService);
      expect((service as any).importCronSchedule).toBeUndefined();
    });

    it("should use default station concurrency if not set", async () => {
      module = await buildModule();
      service = module.get<DataImporterService>(DataImporterService);
      expect((service as any).stationConcurrencyLimit).toBe(1); // Default from buildModule mock
    });

    it("should use provided station concurrency", async () => {
      module = await buildModule({ DATA_IMPORT_STATION_CONCURRENCY: "10" });
      service = module.get<DataImporterService>(DataImporterService);
      expect((service as any).stationConcurrencyLimit).toBe(10);
    });

    it("should use default thread concurrency if not set", async () => {
      module = await buildModule();
      service = module.get<DataImporterService>(DataImporterService);
      expect((service as any).threadConcurrencyLimit).toBe(1); // Default from buildModule mock
    });

    it("should use provided thread concurrency", async () => {
      module = await buildModule({ DATA_IMPORT_THREAD_CONCURRENCY: "20" });
      service = module.get<DataImporterService>(DataImporterService);
      expect((service as any).threadConcurrencyLimit).toBe(20);
    });

    it("should schedule cron job onModuleInit if enabled and cron is set", async () => {
      module = await buildModule({
        DATA_IMPORT_ENABLED: "true",
        DATA_IMPORT_CRON: "* * * * *",
      });
      service = module.get<DataImporterService>(DataImporterService);
      await service.onModuleInit();
      expect(mockSchedulerRegistry.addCronJob).toHaveBeenCalled();
    });

    it("should NOT schedule cron job onModuleInit if disabled", async () => {
      module = await buildModule({
        DATA_IMPORT_ENABLED: "false",
        DATA_IMPORT_CRON: "* * * * *",
      });
      service = module.get<DataImporterService>(DataImporterService);
      await service.onModuleInit();
      expect(mockSchedulerRegistry.addCronJob).not.toHaveBeenCalled();
    });

    it("should NOT schedule cron job onModuleInit if cron is not set", async () => {
      module = await buildModule({ DATA_IMPORT_ENABLED: "true" });
      service = module.get<DataImporterService>(DataImporterService);
      await service.onModuleInit();
      expect(mockSchedulerRegistry.addCronJob).not.toHaveBeenCalled();
    });

    it("should stop cron job onModuleDestroy", async () => {
      module = await buildModule();
      service = module.get<DataImporterService>(DataImporterService);
      const mockStop = jest.fn();
      (mockSchedulerRegistry.getCronJob as jest.Mock).mockReturnValueOnce({
        stop: mockStop,
      });
      await service.onModuleDestroy();
      expect(mockSchedulerRegistry.getCronJob).toHaveBeenCalledWith(
        "data-import",
      );
      expect(mockStop).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Helper Method Tests
  // ---------------------------------------------------------------------------
  describe("Helper Methods", () => {
    beforeEach(async () => {
      module = await buildModule();
      service = module.get<DataImporterService>(DataImporterService);
    });

    describe("getNumericCfg", () => {
      it("should return parsed number if valid", () => {
        mockConfigService.get.mockReturnValueOnce("123");
        expect((service as any).getNumericCfg("TEST_KEY", 5)).toBe(123);
      });
      it("should return default if undefined", () => {
        mockConfigService.get.mockReturnValueOnce(undefined);
        expect((service as any).getNumericCfg("TEST_KEY", 5)).toBe(5);
      });
      it("should return default if not a number", () => {
        mockConfigService.get.mockReturnValueOnce("abc");
        expect((service as any).getNumericCfg("TEST_KEY", 5)).toBe(5);
      });
    });

    describe("mapTransportType", () => {
      const cases: Array<[string, TransportMode | null]> = [
        ["train", TransportMode.Train],
        ["suburban", TransportMode.Suburban],
        ["bus", TransportMode.Bus],
        ["tram", TransportMode.Tram],
        ["metro", TransportMode.Metro],
        ["water", TransportMode.Water],
        ["helicopter", TransportMode.Helicopter],
        ["plane", TransportMode.Plane],
        ["sea", TransportMode.Sea],
        ["unknown", null], // Expect error
      ];

      test.each(cases)(
        "maps '%s' correctly or throws",
        (yandexType, expectedMode) => {
          if (expectedMode) {
            expect((service as any).mapTransportType(yandexType)).toBe(
              expectedMode,
            );
          } else {
            expect(() => (service as any).mapTransportType(yandexType)).toThrow(
              InternalError,
            );
            expect(() => (service as any).mapTransportType(yandexType)).toThrow(
              `Unknown transport type: ${yandexType}`,
            );
          }
        },
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Main Import Logic Tests
  // ---------------------------------------------------------------------------
  describe("Main Import Logic", () => {
    beforeEach(async () => {
      module = await buildModule(); // Use default concurrency of 1 for easier testing
      service = module.get<DataImporterService>(DataImporterService);
      // Reset isCancelled and isShuttingDown flags before each test
      (service as any).isCancelled = false;
      (service as any).isShuttingDown = false;
    });

    // --- Test Data Builders ---
    const makeYandexStation = (
      id: string,
      country = "Россия",
      transportType: StationTransportType = "suburban",
      region = "TestRegion",
      lat = 55.0,
      lon = 37.0,
    ): StationWithRegion =>
      ({
        codes: { yandex_code: id },
        title: `Station ${id}`,
        transport_type: transportType,
        latitude: lat,
        longitude: lon,
        country,
        region,
        // other fields from YandexStation are not strictly needed by the service logic itself
      }) as StationWithRegion;

    const makeYandexThread = (
      uid: string,
      transportType: ThreadTransportType = "suburban",
    ): ThreadContract =>
      ({
        uid,
        title: `Route ${uid}`,
        number: `N${uid}`,
        short_title: `SN${uid}`,
        transport_type: transportType,
        thread_method_link: `link/to/${uid}`,
        // other fields not strictly needed
      }) as ThreadContract;

    const makeYandexScheduleResponse = (
      threads: ThreadContract[],
    ): StationScheduleResponse => {
      return {
        pagination: { total: threads.length, limit: 100, offset: 0 },
        schedule: threads.map((thread) => ({
          thread,
          departure: "2024-01-01T10:00:00+03:00",
          arrival: null,
          is_fuzzy: false,
          days: "ежедневно",
          stops: "",
          platform: "1",
          terminal: null,
          except_days: null,
        })),
        date: "2024-01-01",
        station: {
          code: "test-station-code",
          title: "Test Station",
          popular_title: null,
          short_title: null,
          transport_type: "suburban" as const,
          station_type: "station",
          station_type_name: "станция",
          type: "station",
        },
        directions: [],
        schedule_direction: { code: "all", title: "Все направления" },
        interval_schedule: [],
      };
    };

    const makeYandexThreadResponse = (
      stops: Array<{
        code: string;
        name: string;
        transport_type?: StationTransportType;
      }>,
      threadUid = "test-uid",
    ): ThreadStationsResponse => {
      return {
        uid: threadUid,
        title: "Test Thread",
        number: "T1",
        short_title: "Test",
        transport_type: "suburban",
        carrier: {
          code: 1,
          title: "Carrier",
          contacts: "",
          url: "",
          logo_svg: null,
          codes: { icao: null, sirena: null, iata: null },
        },
        transport_subtype: {
          title: "Suburban Train",
          code: "sub",
          color: "#FFFFFF",
        },
        express_type: null,
        stops: stops.map((s, index) => ({
          station: {
            code: s.code,
            title: s.name,
            station_type: "station",
            transport_type: s.transport_type ?? "suburban",
            popular_title: null,
            short_title: null,
            station_type_name: "станция",
            type: "station",
          } as StationContract,
          departure:
            index < stops.length - 1
              ? `2024-01-01T10:0${index}:00+03:00`
              : null,
          arrival: index > 0 ? `2024-01-01T09:5${index}:00+03:00` : null,
          terminal: null,
          platform: (index + 1).toString(),
          stop_time: index > 0 && index < stops.length - 1 ? 60 : null,
          duration: index > 0 ? 300 : 0,
        })),
        vehicle: null,
        from: "s1",
        to: "s2",
        except_days: "",
        days: "ежедневно",
        start_date: "2024-01-01",
        departure_date: null,
        arrival_date: null,
        start_time: "10:00",
      };
    };

    const makeRawYandexStationsListResponse = (
      stations: StationWithRegion[],
    ): StationsListResponse =>
      ({
        countries: [
          {
            title: "Россия",
            codes: { yandex_code: "c213" },
            regions: [
              {
                title: "TestRegion",
                codes: { yandex_code: "r1" },
                settlements: [
                  {
                    title: "TestCity",
                    codes: { yandex_code: "s1" },
                    stations: stations.map((s) => ({
                      codes: s.codes,
                      title: s.title,
                      transport_type: s.transport_type,
                      latitude: s.latitude ?? "",
                      longitude: s.longitude ?? "",
                      station_type: "station",
                      direction: "",
                      popular_title: null,
                      short_title: null,
                      station_type_name: "станция",
                      type: "station",
                    })),
                  },
                ],
              },
            ],
          },
        ],
      }) as unknown as StationsListResponse;

    // --- Tests ---
    it("should import stations and routes successfully (happy path)", async () => {
      const station1 = makeYandexStation("s1");
      const station2 = makeYandexStation("s2");
      const thread1 = makeYandexThread("t1");

      mockYandexService.getStationsList.mockResolvedValue(
        resultSuccess({ stations: [station1, station2] }),
      );
      mockYandexService.getStationSchedule.mockImplementation(
        async ({ station }) => {
          if (station === "s1") {
            return resultSuccess(makeYandexScheduleResponse([thread1]));
          }
          return resultSuccess(makeYandexScheduleResponse([]));
        },
      );
      mockYandexService.getThreadStations.mockResolvedValue(
        resultSuccess(
          makeYandexThreadResponse(
            [
              { code: "s1", name: "Station s1" },
              { code: "s2", name: "Station s2" },
            ],
            "t1",
          ),
        ),
      );

      const result = await service.importAllData();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(
          "Successfully imported 2 stations and 1 routes",
        );
      }

      expect(mockStationOrmService.upsertStations).toHaveBeenCalledTimes(1);
      expect(mockStationOrmService.upsertStations).toHaveBeenCalledWith([
        {
          id: "s1",
          fullName: "Station s1",
          transportMode: TransportMode.Suburban,
          latitude: 55.0,
          longitude: 37.0,
          country: "Россия",
          region: "TestRegion",
        },
        {
          id: "s2",
          fullName: "Station s2",
          transportMode: TransportMode.Suburban,
          latitude: 55.0,
          longitude: 37.0,
          country: "Россия",
          region: "TestRegion",
        },
      ]);

      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledTimes(1);
      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledWith({
        threadUid: "t1",
        shortTitle: "Nt1",
        fullTitle: "Route t1",
        transportType: TransportMode.Suburban,
        routeInfoUrl: "link/to/t1",
        stopIds: ["s1", "s2"],
      });
    });

    it("should filter stations by country", async () => {
      const stationRu = makeYandexStation("s_ru", "Россия");
      const stationOther = makeYandexStation("s_other", "ДругаяСтрана");

      mockYandexService.getStationsList.mockResolvedValue(
        resultSuccess({ stations: [stationRu, stationOther] }),
      );
      mockYandexService.getStationSchedule.mockResolvedValue(
        resultSuccess(makeYandexScheduleResponse([])),
      );

      await service.importAllData();

      expect(mockStationOrmService.upsertStations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "s_ru" }),
          expect.objectContaining({ id: "s_other" }),
        ]),
      );
      expect(mockYandexService.getStationSchedule).toHaveBeenCalledTimes(1);
      expect(mockYandexService.getStationSchedule).toHaveBeenCalledWith({
        station: "s_ru",
      });
    });

    it("should filter stations by allowed transport types for persistence", async () => {
      const stationSuburban = makeYandexStation("s_sub", "Россия", "suburban");
      const stationTrain = makeYandexStation("s_train", "Россия", "train");
      const stationPlane = makeYandexStation("s_plane", "Россия", "plane");
      const stationBus = makeYandexStation(
        "s_bus",
        "Россия",
        "bus" as StationTransportType,
      );

      mockYandexService.getStationsList.mockResolvedValue(
        resultSuccess({
          stations: [stationSuburban, stationTrain, stationPlane, stationBus],
        }),
      );
      mockYandexService.getStationSchedule.mockResolvedValue(
        resultSuccess(makeYandexScheduleResponse([])),
      );

      await service.importAllData();

      expect(mockStationOrmService.upsertStations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "s_sub",
            transportMode: TransportMode.Suburban,
          }),
          expect.objectContaining({
            id: "s_train",
            transportMode: TransportMode.Train,
          }),
          expect.objectContaining({
            id: "s_plane",
            transportMode: TransportMode.Plane,
          }),
        ]),
      );
      expect(mockStationOrmService.upsertStations).not.toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: "s_bus" })]),
      );
      expect(mockYandexService.getStationSchedule).toHaveBeenCalledTimes(3);
      expect(mockYandexService.getStationSchedule).toHaveBeenCalledWith({
        station: "s_sub",
      });
      expect(mockYandexService.getStationSchedule).toHaveBeenCalledWith({
        station: "s_train",
      });
      expect(mockYandexService.getStationSchedule).toHaveBeenCalledWith({
        station: "s_plane",
      });
    });

    it("should filter threads by allowed transport types", async () => {
      const station1 = makeYandexStation("s1");
      const threadSuburban = makeYandexThread("t_sub", "suburban");
      const threadTrain = makeYandexThread(
        "t_train",
        "train" as ThreadTransportType,
      );

      mockYandexService.getStationsList.mockResolvedValue(
        resultSuccess({ stations: [station1] }),
      );
      mockYandexService.getStationSchedule.mockResolvedValue(
        resultSuccess(
          makeYandexScheduleResponse([threadSuburban, threadTrain]),
        ),
      );
      mockYandexService.getThreadStations.mockResolvedValue(
        resultSuccess(
          makeYandexThreadResponse(
            [{ code: "s1", name: "Station s1" }],
            "t_sub",
          ),
        ),
      );

      await service.importAllData();

      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledTimes(1);
      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledWith(
        expect.objectContaining({ threadUid: "t_sub" }),
      );
      expect(mockRouteOrmService.upsertRouteWithStops).not.toHaveBeenCalledWith(
        expect.objectContaining({ threadUid: "t_train" }),
      );
    });

    it("should handle Yandex API error when fetching stations list", async () => {
      const apiError = new InternalError("Failed to fetch stations");
      mockYandexService.getStationsList.mockResolvedValue(
        resultError(apiError),
      );

      const result = await service.importAllData();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toContain("Unable to fetch station list");
        expect(result.error.message).toContain("Failed to fetch stations");
      }
      expect(mockStationOrmService.upsertStations).not.toHaveBeenCalled();
      expect(mockRouteOrmService.upsertRouteWithStops).not.toHaveBeenCalled();
    });

    it("should log and skip station if fetching its schedule fails", async () => {
      const station1 = makeYandexStation("s1");
      const station2 = makeYandexStation("s2");
      const thread1 = makeYandexThread("t1");

      mockYandexService.getStationsList.mockResolvedValue(
        resultSuccess({ stations: [station1, station2] }),
      );
      const scheduleApiError = new InternalError("Schedule unavailable");
      mockYandexService.getStationSchedule.mockImplementation(
        async ({ station }) => {
          if (station === "s1")
            return resultSuccess(makeYandexScheduleResponse([thread1]));
          if (station === "s2") return resultError(scheduleApiError);
          return resultSuccess(makeYandexScheduleResponse([]));
        },
      );
      mockYandexService.getThreadStations.mockResolvedValue(
        resultSuccess(
          makeYandexThreadResponse([{ code: "s1", name: "Station s1" }], "t1"),
        ),
      );
      const loggerVerboseSpy = jest.spyOn((service as any).logger, "verbose");

      const result = await service.importAllData();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain("1 routes");
      }
      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledTimes(1);
      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledWith(
        expect.objectContaining({ threadUid: "t1" }),
      );
      expect(loggerVerboseSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Schedule fetch failed for station s2: InternalError: ${scheduleApiError.message}`,
        ),
      );
      loggerVerboseSpy.mockRestore();
    });

    it("should log and skip thread if fetching its details fails", async () => {
      const station1 = makeYandexStation("s1");
      const thread1 = makeYandexThread("t1");
      const thread2 = makeYandexThread("t2");

      mockYandexService.getStationsList.mockResolvedValue(
        resultSuccess({ stations: [station1] }),
      );
      mockYandexService.getStationSchedule.mockResolvedValue(
        resultSuccess(
          makeYandexScheduleResponse([
            thread1,
            thread2,
          ]) as StationScheduleResponse,
        ),
      );
      const threadApiError = new InternalError("Thread details unavailable");
      mockYandexService.getThreadStations.mockImplementation(
        async ({ uid }) => {
          if (uid === "t1") return resultError(threadApiError);
          if (uid === "t2")
            return resultSuccess(
              makeYandexThreadResponse(
                [{ code: "s1", name: "Station s1" }],
                "t2",
              ),
            );
          return resultError(new InternalError("Unknown thread UID"));
        },
      );
      const loggerVerboseSpy = jest.spyOn((service as any).logger, "verbose");

      const result = await service.importAllData();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain("1 routes");
      }
      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledTimes(1);
      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledWith(
        expect.objectContaining({ threadUid: "t2" }),
      );
      expect(loggerVerboseSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Thread fetch failed for station s1, thread t1: InternalError: ${threadApiError.message}`,
        ),
      );
      loggerVerboseSpy.mockRestore();
    });

    it("should not process the same thread UID twice", async () => {
      const station1 = makeYandexStation("s1");
      const station2 = makeYandexStation("s2");
      const thread1 = makeYandexThread("t1_same");

      mockYandexService.getStationsList.mockResolvedValue(
        resultSuccess({ stations: [station1, station2] }),
      );
      mockYandexService.getStationSchedule.mockImplementation(
        async ({ station }) => {
          return resultSuccess(makeYandexScheduleResponse([thread1]));
        },
      );
      mockYandexService.getThreadStations.mockResolvedValue(
        resultSuccess(
          makeYandexThreadResponse(
            [{ code: "s1", name: "Station s1" }],
            "t1_same",
          ),
        ),
      );

      await service.importAllData();

      expect(mockYandexService.getThreadStations).toHaveBeenCalledTimes(1);
      expect(mockYandexService.getThreadStations).toHaveBeenCalledWith({
        uid: "t1_same",
      });
      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledTimes(1);
      expect(mockRouteOrmService.upsertRouteWithStops).toHaveBeenCalledWith(
        expect.objectContaining({ threadUid: "t1_same" }),
      );
    });

    it("should handle graceful shutdown (isShuttingDown)", async () => {
      const station1 = makeYandexStation("s1");
      const station2 = makeYandexStation("s2");
      mockYandexService.getStationsList.mockResolvedValue(
        resultSuccess({ stations: [station1, station2] }),
      );

      mockYandexService.getStationSchedule.mockImplementationOnce(async () => {
        (service as any).isShuttingDown = true;
        return resultSuccess(makeYandexScheduleResponse([]));
      });

      await service.importAllData();

      expect(mockYandexService.getStationSchedule).toHaveBeenCalledTimes(1);
      expect(mockYandexService.getStationSchedule).toHaveBeenCalledWith({
        station: "s1",
      });
      expect(mockRouteOrmService.upsertRouteWithStops).not.toHaveBeenCalled();
    });

    it("should handle cancellation (isCancelled set by error)", async () => {
      const station1 = makeYandexStation("s1");
      const station2 = makeYandexStation("s2");
      mockYandexService.getStationsList.mockResolvedValue(
        resultError(new InternalError("critical failure")),
      );

      mockYandexService.getStationSchedule.mockImplementation(async () => {
        expect((service as any).isCancelled).toBe(true);
        return resultSuccess(makeYandexScheduleResponse([]));
      });

      const result = await service.importAllData();

      expect(result.success).toBe(false);
      expect((service as any).isCancelled).toBe(true);
      expect(mockYandexService.getStationSchedule).not.toHaveBeenCalled();
    });

    it("handleDailyImport should call importAllData and log result", async () => {
      const importAllDataSpy = jest
        .spyOn(service, "importAllData")
        .mockResolvedValue(resultSuccess("OK!"));
      const loggerLogSpy = jest.spyOn((service as any).logger, "log");
      const loggerErrorSpy = jest.spyOn((service as any).logger, "error");

      await service.handleDailyImport();

      expect(importAllDataSpy).toHaveBeenCalledTimes(1);
      expect(loggerLogSpy).toHaveBeenCalledWith("OK!");
      expect(loggerErrorSpy).not.toHaveBeenCalled();

      importAllDataSpy.mockRestore();
      loggerLogSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it("handleDailyImport should call importAllData and log error", async () => {
      const error = new InternalError("FAIL!");
      const importAllDataSpy = jest
        .spyOn(service, "importAllData")
        .mockResolvedValue(resultError(error));
      const loggerLogSpy = jest.spyOn((service as any).logger, "log");
      const loggerErrorSpy = jest.spyOn((service as any).logger, "error");

      await service.handleDailyImport();

      expect(importAllDataSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(error);
      expect(loggerLogSpy).not.toHaveBeenCalledWith("FAIL!");

      importAllDataSpy.mockRestore();
      loggerLogSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });
  });
});
