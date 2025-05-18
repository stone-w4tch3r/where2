import { Test, TestingModule } from "@nestjs/testing";
import { StationsService } from "./stations.service";
import { StationOrmService } from "../prisma/station-orm.service";
import { Station } from "../prisma/models";
import { TransportMode } from "../shared/transport-mode.dto";
import { Result, resultSuccess, resultError } from "../utils/Result";
import { AppError, NotFoundError, InternalError } from "../utils/errors";
import { StationFilterDto } from "./dto/station-filter.dto";
import { Logger } from "@nestjs/common";

// -----------------------------------------------------------------------------------
// Minimal in-memory fixtures & builders
// -----------------------------------------------------------------------------------

interface TestStationModelInput {
  id: string;
  fullName?: string;
  transportMode?: TransportMode;
  latitude?: number | null;
  longitude?: number | null;
  country?: string;
  region?: string;
  yandexStationCode?: string | null;
  esrCode?: string | null;
  shortName?: string | null;
}

function makeTestStationModel(input: TestStationModelInput): Station {
  return {
    id: input.id,
    fullName: input.fullName ?? `Station Full Name ${input.id}`,
    transportMode: input.transportMode ?? TransportMode.Suburban,
    latitude: input.latitude === undefined ? 59.93428 : input.latitude, // Default if undefined, allow null
    longitude: input.longitude === undefined ? 30.3351 : input.longitude,
    country: input.country ?? "RU",
    region: input.region ?? "Test Region",
    yandexStationCode:
      input.yandexStationCode === undefined
        ? `yandex_${input.id}`
        : input.yandexStationCode,
    esrCode: input.esrCode === undefined ? `esr_${input.id}` : input.esrCode,
    shortName:
      input.shortName === undefined ? `S ${input.id}` : input.shortName,
    // Add any other mandatory fields from the Station model with defaults
  } as Station;
}

// Common test data
const station1 = makeTestStationModel({
  id: "s1",
  fullName: "Station One",
  latitude: 10,
  longitude: 20,
});
const station2 = makeTestStationModel({
  id: "s2",
  fullName: "Station Two",
  transportMode: TransportMode.Bus,
  latitude: null,
  longitude: null,
});
const station3 = makeTestStationModel({
  id: "s3",
  fullName: "Another Station",
  latitude: 12,
  longitude: 22,
});

// -----------------------------------------------------------------------------------
// Mocks for ORM service and Logger
// -----------------------------------------------------------------------------------

let mockStationOrmService: jest.Mocked<StationOrmService>;
// Mock Logger if its methods are called and need to be asserted or suppressed further
// For now, the service instantiates its own logger, which NestJS handles.
// If we need to spy on logger.error, we might need to inject it or use a global mock.

async function buildTestingModule(): Promise<TestingModule> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      StationsService,
      {
        provide: StationOrmService,
        useValue: {
          findMany: jest.fn(),
          findOne: jest.fn(),
          findByName: jest.fn(),
          findByRadius: jest.fn(),
          // Mock other ORM methods if they become used by StationsService
        },
      },
      // { provide: Logger, useValue: { error: jest.fn(), log: jest.fn(), warn: jest.fn() } } // Optional: if we want to control logger from tests
    ],
  })
    .setLogger(new Logger()) // Suppress console logs from the service itself during tests if not explicitly testing them
    .compile();

  mockStationOrmService = module.get(StationOrmService);
  return module;
}

// -----------------------------------------------------------------------------------
// Test suite
// -----------------------------------------------------------------------------------

describe("StationsService", () => {
  let service: StationsService;

  beforeEach(async () => {
    const module = await buildTestingModule();
    service = module.get<StationsService>(StationsService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // --- findAll ---
  describe("findAll", () => {
    it("should return all stations if no filter is provided", async () => {
      mockStationOrmService.findMany.mockResolvedValue([station1, station2]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([station1, station2]);
      }
      expect(mockStationOrmService.findMany).toHaveBeenCalledWith({});
    });

    it("should return filtered stations if a filter is provided", async () => {
      const filter: StationFilterDto = { transportMode: TransportMode.Bus };
      mockStationOrmService.findMany.mockResolvedValue([station2]);
      const result = await service.findAll(filter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([station2]);
      }
      expect(mockStationOrmService.findMany).toHaveBeenCalledWith(filter);
    });

    it("should return an empty array if no stations match the filter", async () => {
      const filter: StationFilterDto = { region: "NonExistentRegion" };
      mockStationOrmService.findMany.mockResolvedValue([]);
      const result = await service.findAll(filter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("should return InternalError if ORM findMany fails", async () => {
      const dbError = new Error("DB connection lost");
      mockStationOrmService.findMany.mockRejectedValue(dbError);
      const result = await service.findAll();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe("Failed to fetch stations");
      }
    });
  });

  // --- findOne ---
  describe("findOne", () => {
    it("should return a station by its ID", async () => {
      mockStationOrmService.findOne.mockResolvedValue(station1);
      const result = await service.findOne("s1");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(station1);
      }
      expect(mockStationOrmService.findOne).toHaveBeenCalledWith("s1");
    });

    it("should return NotFoundError if station with ID does not exist", async () => {
      mockStationOrmService.findOne.mockResolvedValue(null);
      const result = await service.findOne("nonExistentId");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(NotFoundError);
        expect(result.error.message).toBe(
          "Station with id nonExistentId not found",
        );
      }
    });

    // Note: The current implementation of findOne in StationsService does not use executeWithResult directly for the ORM call,
    // so it won't produce an InternalError from that helper. It relies on handleNotFound.
    // If stationOrm.findOne itself throws, it would be an unhandled promise rejection in the test if not caught by a try/catch in the service.
    // However, the `executeWithResult` is used in other methods, so we keep its test coverage through those.
    // If stationOrm.findOne can throw an error that should be caught and wrapped as an InternalError, StationsService.findOne needs adjustment.
    // For now, testing based on current implementation:
    it("should propagate error if ORM findOne unexpectedly fails (not just returns null)", async () => {
      const dbError = new Error("DB critical failure");
      mockStationOrmService.findOne.mockRejectedValue(dbError);
      // This tests how NestJS or global error handlers might deal with it, or if the service itself should catch.
      // Based on current code, this specific error is not caught by executeWithResult for findOne.
      // The test reflects that an error from stationOrm.findOne, if not null, isn't wrapped by `handleNotFound` into a custom AppError for this path.
      // The goal is to see if the service has a catch block for the `await this.stationOrm.findOne(id)` line.
      // It does not, so the promise will reject and the test framework will catch it.
      await expect(service.findOne("s1")).rejects.toThrow(
        "DB critical failure",
      );
    });
  });

  // --- findByName ---
  describe("findByName", () => {
    it("should return stations matching the name", async () => {
      mockStationOrmService.findByName.mockResolvedValue([station1]);
      const result = await service.findByName("Station One");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([station1]);
      }
      expect(mockStationOrmService.findByName).toHaveBeenCalledWith(
        "Station One",
      );
    });

    it("should return an empty array if no stations match the name", async () => {
      mockStationOrmService.findByName.mockResolvedValue([]);
      const result = await service.findByName("NonExistent Name");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("should return InternalError if ORM findByName fails", async () => {
      const dbError = new Error("DB query error");
      mockStationOrmService.findByName.mockRejectedValue(dbError);
      const result = await service.findByName("Some Name");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe(
          "Failed to find stations by name: Some Name",
        );
      }
    });
  });

  // --- findByRadius ---
  describe("findByRadius", () => {
    const lat = 10,
      lon = 20,
      radiusKm = 5;
    it("should return stations within the radius", async () => {
      mockStationOrmService.findByRadius.mockResolvedValue([station1]);
      const result = await service.findByRadius(lat, lon, radiusKm);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([station1]);
      }
      expect(mockStationOrmService.findByRadius).toHaveBeenCalledWith(
        lat,
        lon,
        radiusKm,
      );
    });

    it("should return an empty array if no stations are in the radius", async () => {
      mockStationOrmService.findByRadius.mockResolvedValue([]);
      const result = await service.findByRadius(lat, lon, radiusKm);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("should return InternalError if ORM findByRadius fails", async () => {
      const dbError = new Error("Spatial query failed");
      mockStationOrmService.findByRadius.mockRejectedValue(dbError);
      const result = await service.findByRadius(lat, lon, radiusKm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toBe(
          "Failed to find stations by coordinates",
        );
      }
    });
  });
});
