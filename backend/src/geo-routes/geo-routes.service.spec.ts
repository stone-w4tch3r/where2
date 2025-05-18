import { Test, TestingModule } from "@nestjs/testing";
import { GeoRoutesService } from "./geo-routes.service";
import { StationsService } from "../stations/stations.service";
import { RoutesService } from "../routes/routes.service";
import { Station, RouteWithStops } from "../prisma/models";
import { Result, resultSuccess, resultError } from "../utils/Result";
import { AppError, InternalError } from "../utils/errors";
import { GetByRadiusDto } from "./dto/get-by-radius.dto";
import { GetByBoxDto } from "./dto/get-by-box.dto";
import { StationFilterDto } from "../stations/dto/station-filter.dto";
import { Logger } from "@nestjs/common";
// Assuming TransportMode might be used, similar to reachability tests.
// If not directly used by these models, this can be removed.
// import { TransportMode } from "../shared/transport-mode.dto";

// -----------------------------------------------------------------------------------
// Minimal in-memory fixtures & builders
// -----------------------------------------------------------------------------------

interface StationInput {
  id: string;
  name?: string;
  latitude?: number | null;
  longitude?: number | null;
}

function makeStation(input: StationInput): Station {
  return {
    id: input.id,
    fullName: input.name ?? `Station ${input.id}`,
    transportMode: "suburban", // Example default, adjust if TransportMode enum is strictly needed
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    country: "RU",
    region: "Test-Region",
    yandexStationCode: null,
    esrCode: null,
    shortName: null,
  } as Station;
}

interface RouteInput {
  id: string;
  stops: Station[];
}

function makeRouteWithStops(input: RouteInput): RouteWithStops {
  const routeStopsWithStation = input.stops.map((s, i) => ({
    id: i + 1, // Mock DB id for RouteStation / RouteStop
    routeId: input.id,
    stationId: s.id,
    stopPosition: i,
    station: s, // Full nested station object
    // Add any other fields required by RouteStop, e.g., arrivalTime, departureTime if they exist on the type
  }));

  return {
    id: input.id,
    threadUid: `thread-${input.id}`,
    shortTitle: `Route ${input.id}`,
    fullTitle: `Route ${input.id} Full Title`,
    transportMode: "suburban",
    transportType: "suburban",
    routeInfoUrl: null,
    stops: routeStopsWithStation, // Corrected: Use the mapped array here
    carrierId: null,
    carrier: null,
    firstStationId: input.stops[0]?.id ?? null,
    lastStationId: input.stops[input.stops.length - 1]?.id ?? null,
    firstStation: input.stops[0] ?? null,
    lastStation: input.stops[input.stops.length - 1] ?? null,
    // routeStations: routeStopsWithStation, // Removed, as stops should now hold this structure
  } as unknown as RouteWithStops; // Using unknown first then RouteWithStops for broader compatibility if types are complex
}

// Common test data
const station1 = makeStation({
  id: "s1",
  name: "Station 1",
  latitude: 10,
  longitude: 20,
});
const station2 = makeStation({
  id: "s2",
  name: "Station 2",
  latitude: 11,
  longitude: 21,
});
const station3 = makeStation({
  id: "s3",
  name: "Station 3",
  latitude: 5,
  longitude: 15,
});

const route1 = makeRouteWithStops({ id: "r1", stops: [station1, station2] });
const route2 = makeRouteWithStops({ id: "r2", stops: [station2, station3] });

// -----------------------------------------------------------------------------------
// Mocks for services
// -----------------------------------------------------------------------------------

let mockStationsService: jest.Mocked<StationsService>;
let mockRoutesService: jest.Mocked<RoutesService>;

async function buildTestingModule(): Promise<TestingModule> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      GeoRoutesService,
      {
        provide: StationsService,
        useValue: {
          findByRadius: jest.fn(),
          findAll: jest.fn(),
        },
      },
      {
        provide: RoutesService,
        useValue: {
          findByStation: jest.fn(),
        },
      },
    ],
  })
    .setLogger(new Logger()) // Suppress console logs from the service during tests
    .compile();

  // Get mocked instances after module compilation
  mockStationsService = module.get(StationsService);
  mockRoutesService = module.get(RoutesService);

  return module;
}

// -----------------------------------------------------------------------------------
// Test suite
// -----------------------------------------------------------------------------------

describe("GeoRoutesService", () => {
  let service: GeoRoutesService;

  beforeEach(async () => {
    const module = await buildTestingModule();
    service = module.get<GeoRoutesService>(GeoRoutesService);
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // -----------------------------------------------------------------------------------
  // Tests for getByRadius
  // -----------------------------------------------------------------------------------
  describe("getByRadius", () => {
    const getByRadiusDto: GetByRadiusDto = {
      latitude: 10,
      longitude: 20,
      radius: 1000,
    };

    it("should return routes for stations found by radius and deduplicate them", async () => {
      mockStationsService.findByRadius.mockResolvedValue(
        resultSuccess([station1, station2]),
      );
      // station1 is on route1
      // station2 is on route1 and route2
      mockRoutesService.findByStation
        .mockResolvedValueOnce(resultSuccess([route1])) // For station1
        .mockResolvedValueOnce(resultSuccess([route1, route2])); // For station2

      const result = await service.getByRadius(getByRadiusDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expect.arrayContaining([route1, route2]));
        expect(result.data.length).toBe(2); // route1 (from s1, s2), route2 (from s2)
      }
      expect(mockStationsService.findByRadius).toHaveBeenCalledWith(
        getByRadiusDto.latitude,
        getByRadiusDto.longitude,
        getByRadiusDto.radius,
      );
      expect(mockRoutesService.findByStation).toHaveBeenCalledWith(station1.id);
      expect(mockRoutesService.findByStation).toHaveBeenCalledWith(station2.id);
    });

    it("should return an empty array if no stations are found", async () => {
      mockStationsService.findByRadius.mockResolvedValue(resultSuccess([]));

      const result = await service.getByRadius(getByRadiusDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
      expect(mockRoutesService.findByStation).not.toHaveBeenCalled();
    });

    it("should return an error if StationsService.findByRadius fails", async () => {
      const error = new InternalError("Station service failure");
      mockStationsService.findByRadius.mockResolvedValue(resultError(error));

      const result = await service.getByRadius(getByRadiusDto);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });

    it("should proceed and return routes from successful RoutesService calls even if some fail for other stations", async () => {
      const routeServiceError = new InternalError(
        "Route service failure for one station",
      );
      const stationOther = makeStation({ id: "s_other" });
      const routeOther = makeRouteWithStops({
        id: "r_other",
        stops: [stationOther],
      });

      mockStationsService.findByRadius.mockResolvedValue(
        resultSuccess([station1, station2, stationOther]),
      ); // station1, station2, stationOther
      mockRoutesService.findByStation
        .mockResolvedValueOnce(resultSuccess([route1])) // For station1 -> route1
        .mockResolvedValueOnce(resultError(routeServiceError)) // For station2 -> error
        .mockResolvedValueOnce(resultSuccess([routeOther])); // For stationOther -> routeOther

      const result = await service.getByRadius(getByRadiusDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(
          expect.arrayContaining([route1, routeOther]),
        );
        expect(result.data.length).toBe(2); // route1 and routeOther, route2 skipped
      }
      expect(mockRoutesService.findByStation).toHaveBeenCalledTimes(3);
    });
  });

  // -----------------------------------------------------------------------------------
  // Tests for getByCoordinateBox
  // -----------------------------------------------------------------------------------
  describe("getByCoordinateBox", () => {
    const getByBoxDto: GetByBoxDto = {
      minLatitude: 5,
      minLongitude: 15,
      maxLatitude: 15,
      maxLongitude: 25,
    };

    it("should return routes for stations found by coordinate box and deduplicate them", async () => {
      // station1 (10,20) and station3 (5,15) should be in the box
      // station1 on route1. station3 on route2.
      mockStationsService.findAll.mockResolvedValue(
        resultSuccess([station1, station3]),
      );
      mockRoutesService.findByStation
        .mockResolvedValueOnce(resultSuccess([route1])) // For station1
        .mockResolvedValueOnce(resultSuccess([route2])); // For station3

      const result = await service.getByCoordinateBox(getByBoxDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expect.arrayContaining([route1, route2]));
        expect(result.data.length).toBe(2);
      }

      const expectedFilter: StationFilterDto = {
        minLat: getByBoxDto.minLatitude,
        minLon: getByBoxDto.minLongitude,
        maxLat: getByBoxDto.maxLatitude,
        maxLon: getByBoxDto.maxLongitude,
      };
      expect(mockStationsService.findAll).toHaveBeenCalledWith(expectedFilter);
      expect(mockRoutesService.findByStation).toHaveBeenCalledWith(station1.id);
      expect(mockRoutesService.findByStation).toHaveBeenCalledWith(station3.id);
    });

    it("should return an empty array if no stations are found", async () => {
      mockStationsService.findAll.mockResolvedValue(resultSuccess([]));

      const result = await service.getByCoordinateBox(getByBoxDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
      expect(mockRoutesService.findByStation).not.toHaveBeenCalled();
    });

    it("should return an error if StationsService.findAll fails", async () => {
      const error = new InternalError("Station service failure");
      mockStationsService.findAll.mockResolvedValue(resultError(error));

      const result = await service.getByCoordinateBox(getByBoxDto);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });

    it("should correctly deduplicate routes if multiple stations in box share routes", async () => {
      // station1 and station2 are on route1. Assume both are found by findAll.
      mockStationsService.findAll.mockResolvedValue(
        resultSuccess([station1, station2]),
      );
      mockRoutesService.findByStation
        .mockResolvedValueOnce(resultSuccess([route1])) // For station1
        .mockResolvedValueOnce(resultSuccess([route1, route2])); // For station2 (on route1 and route2)

      const result = await service.getByCoordinateBox(getByBoxDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expect.arrayContaining([route1, route2]));
        expect(result.data.length).toBe(2); // route1, route2
      }
    });
  });
});
