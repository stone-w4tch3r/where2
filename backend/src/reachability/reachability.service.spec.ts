import { TestingModule, Test } from "@nestjs/testing";
import {
  ReachabilityResult,
  ReachabilityService,
} from "./reachability.service";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { NotFoundError, InternalError, AppError } from "../utils/errors";
import { TransportMode } from "../shared/transport-mode.dto";
import type { Station, Route } from "../prisma/models";

// -----------------------------------------------------------------------------------
// Minimal in-memory fixtures & builders — keeps arrange-code DRY.
// -----------------------------------------------------------------------------------

interface StationInput {
  id: string;
  name?: string;
}

function makeStation({ id, name }: StationInput): Station {
  return {
    id,
    fullName: name ?? `Station ${id}`,
    transportMode: TransportMode.Suburban,
    latitude: null,
    longitude: null,
    country: "RU",
    region: "Test-Region",
  } as Station;
}

interface RouteInput {
  id: string;
  stops: string[]; // ordered list of stationIds
}

function makeRoute({ id, stops }: RouteInput): Route {
  return {
    id,
    threadUid: id,
    shortTitle: id,
    fullTitle: `Route ${id}`,
    transportType: TransportMode.Suburban,
    routeInfoUrl: null,
    stops, // we keep extra property for convenience (not in prisma model)
  } as unknown as Route; // Cast because tests don't need every field strictly.
}

// -----------------------------------------------------------------------------------
// Jest mocks for the two ORM services.  Each test case supplies its own fixture-data
// to avoid hidden cross-test state.  The tiny helper below wires the mocks.
// -----------------------------------------------------------------------------------

type RouteStopRow = {
  routeId: string;
  stationId: string;
  stopPosition: number;
};

type StationRouteStopRow = RouteStopRow & { id: number };

function buildModule(fixture: {
  stations: Station[];
  routes: RouteInput[];
  fail?: { stationOrm?: Error; routeOrm?: Error };
}): Promise<TestingModule> {
  // Pre-calculate routeStops rows from routes definition
  const routeStops: RouteStopRow[] = fixture.routes.flatMap(({ id, stops }) =>
    stops.map((stationId, idx) => ({
      routeId: id,
      stationId,
      stopPosition: idx,
    })),
  );

  const stationOrmMock = {
    findOne: jest.fn(async (id: string) => {
      if (fixture.fail?.stationOrm) throw fixture.fail.stationOrm;
      return fixture.stations.find((s) => s.id === id);
    }),
    upsertStations: jest.fn(),
  } as unknown as StationOrmService;

  const routeOrmMock = {
    findRouteStopsByRoute: jest.fn(async (routeId: string) => {
      if (fixture.fail?.routeOrm) throw fixture.fail.routeOrm;
      return routeStops.filter((r) => r.routeId === routeId);
    }),
    findRouteStopsByStation: jest.fn(
      async (stationId: string): Promise<StationRouteStopRow[]> => {
        if (fixture.fail?.routeOrm) throw fixture.fail.routeOrm;
        return routeStops
          .filter((r) => r.stationId === stationId)
          .map((r, i) => ({ ...r, id: i + 1 }));
      },
    ),
    findBaseRouteById: jest.fn(async (routeId: string) => {
      const def = fixture.routes.find((r) => r.id === routeId);
      return def ? makeRoute(def) : undefined;
    }),
    upsertRouteWithStops: jest.fn(),
  } as unknown as RouteOrmService;

  return Test.createTestingModule({
    providers: [
      ReachabilityService,
      { provide: StationOrmService, useValue: stationOrmMock },
      { provide: RouteOrmService, useValue: routeOrmMock },
    ],
  }).compile();
}

// -----------------------------------------------------------------------------------
// Table-driven test cases.  Each entry defines a minimal network and expected result.
// -----------------------------------------------------------------------------------

type Case = {
  title: string;
  originId: string;
  maxTransfers: number;
  stations: StationInput[];
  routes: RouteInput[];
  expected:
    | { success: true; reachableIds: Array<[string, number]> } // stationId, transfers
    | { success: false; error: "not-found" | "internal" };
};

const CASES: Case[] = [
  {
    title: "fails when origin station is missing",
    originId: "X",
    maxTransfers: 2,
    stations: [],
    routes: [],
    expected: { success: false, error: "not-found" },
  },
  {
    title: "no routes from origin → returns empty list",
    originId: "A",
    maxTransfers: 3,
    stations: [{ id: "A" }],
    routes: [],
    expected: { success: true, reachableIds: [] },
  },
  {
    title: "simple line A-B-C with maxTransfers 2 reaches both",
    originId: "A",
    maxTransfers: 2,
    stations: [{ id: "A" }, { id: "B" }, { id: "C" }],
    routes: [{ id: "R1", stops: ["A", "B", "C"] }],
    expected: {
      success: true,
      reachableIds: [
        ["B", 0], // same route → 0 transfers
        ["C", 0],
      ],
    },
  },
  {
    title: "requires one transfer A-B (R1) + B-C (R2) when maxTransfers=1",
    originId: "A",
    maxTransfers: 1,
    stations: [{ id: "A" }, { id: "B" }, { id: "C" }],
    routes: [
      { id: "R1", stops: ["A", "B"] },
      { id: "R2", stops: ["B", "C"] },
    ],
    expected: {
      success: true,
      reachableIds: [
        ["B", 0],
        ["C", 1],
      ],
    },
  },
  {
    title: "skips station beyond transfer limit",
    originId: "A",
    maxTransfers: 0,
    stations: [{ id: "A" }, { id: "B" }],
    routes: [{ id: "R1", stops: ["A", "B"] }],
    expected: {
      success: true,
      reachableIds: [["B", 0]],
    },
  },
  {
    title: "propagates InternalError from prisma layer",
    originId: "A",
    maxTransfers: 1,
    stations: [{ id: "A" }],
    routes: [],
    expected: { success: false, error: "internal" },
  },
];

// -----------------------------------------------------------------------------------
// Execute the table.
// -----------------------------------------------------------------------------------

describe("ReachabilityService.calculateReachableStations (refactored)", () => {
  jest.setTimeout(10_000);

  test.each(CASES)("$title", async (c: Case) => {
    // Build fixtures
    const module: TestingModule = await buildModule({
      stations: c.stations.map(makeStation),
      routes: c.routes,
      fail:
        c.expected.success || c.expected.error !== "internal"
          ? undefined
          : { routeOrm: new Error("db-boom") },
    });

    const service = module.get(ReachabilityService);

    const result = await service.calculateReachableStations(
      c.originId,
      c.maxTransfers,
    );

    if (c.expected.success) {
      expect(result.success).toBe(true);
      const reachable = (result as { success: true; data: ReachabilityResult })
        .data.reachableStations;

      // Convert to [id, transfers]
      const ids = reachable.map(
        (r) => [r.station.id, r.transferCount] as [string, number],
      );

      expect(ids).toEqual(expect.arrayContaining(c.expected.reachableIds));
      expect(ids.length).toBe(c.expected.reachableIds.length);
    } else if (c.expected.error === "not-found") {
      expect(result.success).toBe(false);
      expect(
        (result as { success: false; error: AppError }).error,
      ).toBeInstanceOf(NotFoundError);
    } else {
      expect(result.success).toBe(false);
      expect(
        (result as { success: false; error: AppError }).error,
      ).toBeInstanceOf(InternalError);
    }
  });
});
