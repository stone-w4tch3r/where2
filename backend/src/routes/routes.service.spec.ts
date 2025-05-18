import { Test, TestingModule } from "@nestjs/testing";
import { RoutesService } from "./routes.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { Station, RouteWithStops, RouteStop } from "../prisma/models";
import { TransportMode } from "../shared/transport-mode.dto";
import { Result, resultSuccess, resultError } from "../utils/Result";
import { AppError, NotFoundError, InternalError } from "../utils/errors";
import { RouteFilterDto } from "./route-filter.dto";

// -----------------------------------------------------------------------------------
// Minimal in-memory fixtures & builders
// -----------------------------------------------------------------------------------

// Minimal Station for helper purposes
interface TestStationInput {
  id: string;
  name?: string;
  latitude?: number | null;
  longitude?: number | null;
}

function makeTestStation(input: TestStationInput): Station {
  return {
    id: input.id,
    fullName: input.name ?? `Station ${input.id}`,
    transportMode: TransportMode.Suburban,
    latitude: input.latitude ?? 59.93428, // Default to St. Petersburg
    longitude: input.longitude ?? 30.3351,
    country: "RU",
    region: "Test-Region",
    yandexStationCode: `yandex_${input.id}`,
    esrCode: `esr_${input.id}`,
    shortName: `S ${input.id}`,
  } as Station;
}

// RouteStopWithStation would be RouteStop & { station: Station }
// For RouteWithStops, the 'stops' property is an array of these.
type RouteStopWithStation = RouteStop & { station: Station };

interface TestRouteInput {
  id: string;
  // Provide an array of full Station objects or just their IDs for simplicity in test setup
  stopDetails: Array<{
    station: TestStationInput;
    stopPosition: number;
    id?: number;
  }>;
  transportMode?: TransportMode;
  transportType?: string; // e.g., 'suburban', 'bus', etc.
}

function makeTestRouteWithStops(input: TestRouteInput): RouteWithStops {
  const stops: RouteStopWithStation[] = input.stopDetails.map(
    (detail, index) => {
      const station = makeTestStation(detail.station);
      return {
        id: detail.id ?? index + 1, // Mock DB id for RouteStop
        routeId: input.id,
        stationId: station.id,
        stopPosition: detail.stopPosition,
        station: station, // Full nested station object
        // Mock other RouteStop fields if necessary, e.g., arrival/departure times
        arrivalTime: null,
        departureTime: null,
        platform: null,
        isTechnicalStop: false,
      };
    },
  );

  return {
    id: input.id,
    threadUid: `thread-${input.id}`,
    shortTitle: `Route ${input.id}`,
    fullTitle: `Route ${input.id} Full Title`,
    transportMode: input.transportMode ?? TransportMode.Suburban,
    transportType: input.transportType ?? "suburban",
    routeInfoUrl: null,
    stops: stops,
    carrierId: null,
    carrier: null,
    firstStationId: stops[0]?.stationId ?? null,
    lastStationId: stops[stops.length - 1]?.stationId ?? null,
    firstStation: stops[0]?.station ?? null,
    lastStation: stops[stops.length - 1]?.station ?? null,
    // routeStations: stops, // This was the old structure, ensure 'stops' is primary
  } as RouteWithStops;
}

// Common test data
const stationA = { id: "sA", name: "Station A" };
const stationB = { id: "sB", name: "Station B" };
const stationC = { id: "sC", name: "Station C" };

const route1 = makeTestRouteWithStops({
  id: "r1",
  stopDetails: [
    { station: stationA, stopPosition: 0 },
    { station: stationB, stopPosition: 1 },
  ],
});
const route2 = makeTestRouteWithStops({
  id: "r2",
  stopDetails: [
    { station: stationB, stopPosition: 0 },
    { station: stationC, stopPosition: 1 },
  ],
  transportType: "bus",
  transportMode: TransportMode.Bus,
});

// -----------------------------------------------------------------------------------
// Mocks for ORM service
// -----------------------------------------------------------------------------------

let mockRouteOrmService: jest.Mocked<RouteOrmService>;

async function buildTestingModule(): Promise<TestingModule> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      RoutesService,
      {
        provide: RouteOrmService,
        useValue: {
          findRoutesByStation: jest.fn(),
          findRouteById: jest.fn(),
          findAllRoutes: jest.fn(),
          // Mock other ORM methods if they become used by RoutesService
        },
      },
    ],
  }).compile();

  mockRouteOrmService = module.get(RouteOrmService);
  return module;
}

// -----------------------------------------------------------------------------------
// Test suite
// -----------------------------------------------------------------------------------

describe("RoutesService", () => {
  let service: RoutesService;

  beforeEach(async () => {
    const module = await buildTestingModule();
    service = module.get<RoutesService>(RoutesService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // --- findByStation ---
  describe("findByStation", () => {
    it("should return routes for a given stationId", async () => {
      mockRouteOrmService.findRoutesByStation.mockResolvedValue([
        route1,
        route2,
      ]);
      const result = await service.findByStation("sB");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([route1, route2]);
      }
      expect(mockRouteOrmService.findRoutesByStation).toHaveBeenCalledWith(
        "sB",
      );
    });

    it("should return an empty array if no routes found for stationId", async () => {
      mockRouteOrmService.findRoutesByStation.mockResolvedValue([]);
      const result = await service.findByStation("sD"); // Assuming sD has no routes
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("should return an InternalError if ORM fails", async () => {
      const dbError = new Error("DB boom");
      mockRouteOrmService.findRoutesByStation.mockRejectedValue(dbError);
      const result = await service.findByStation("sA");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toContain(
          "Failed to fetch routes: Error: DB boom",
        );
      }
    });
  });

  // --- findOne ---
  describe("findOne", () => {
    it("should return a route by its ID", async () => {
      mockRouteOrmService.findRouteById.mockResolvedValue(route1);
      const result = await service.findOne("r1");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(route1);
      }
      expect(mockRouteOrmService.findRouteById).toHaveBeenCalledWith("r1");
    });

    it("should return NotFoundError if route with ID does not exist", async () => {
      mockRouteOrmService.findRouteById.mockResolvedValue(null);
      const result = await service.findOne("nonExistentId");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(NotFoundError);
        expect(result.error.message).toContain(
          "Route not found: nonExistentId",
        );
      }
    });

    it("should return an InternalError if ORM fails", async () => {
      const dbError = new Error("DB boom");
      mockRouteOrmService.findRouteById.mockRejectedValue(dbError);
      const result = await service.findOne("r1");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toContain(
          "Failed to fetch route: Error: DB boom",
        );
      }
    });
  });

  // --- findAll ---
  describe("findAll", () => {
    it("should return all routes if no filter is provided", async () => {
      mockRouteOrmService.findAllRoutes.mockResolvedValue([route1, route2]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([route1, route2]);
      }
      expect(mockRouteOrmService.findAllRoutes).toHaveBeenCalledWith(undefined);
    });

    it("should return filtered routes if a filter is provided", async () => {
      const filter: RouteFilterDto = { transportMode: TransportMode.Bus };
      mockRouteOrmService.findAllRoutes.mockResolvedValue([route2]); // Assuming route2 is a bus route
      const result = await service.findAll(filter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([route2]);
      }
      expect(mockRouteOrmService.findAllRoutes).toHaveBeenCalledWith(filter);
    });

    it("should return an empty array if no routes match the filter", async () => {
      const filter: RouteFilterDto = { transportMode: TransportMode.Train };
      mockRouteOrmService.findAllRoutes.mockResolvedValue([]);
      const result = await service.findAll(filter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("should return an empty array if ORM returns empty and no filter", async () => {
      mockRouteOrmService.findAllRoutes.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("should return an InternalError if ORM fails", async () => {
      const dbError = new Error("DB boom");
      mockRouteOrmService.findAllRoutes.mockRejectedValue(dbError);
      const result = await service.findAll();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InternalError);
        expect(result.error.message).toContain(
          "Failed to fetch routes: Error: DB boom",
        );
      }
    });
  });
});
