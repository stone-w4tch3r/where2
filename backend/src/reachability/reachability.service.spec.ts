import "jest";
/// <reference types="jest" />
/* eslint-env jest */
import { ReachabilityService } from "./reachability.service";
import { StationOrmService } from "../prisma/station-orm.service";
import { RouteOrmService } from "../prisma/route-orm.service";
import { NotFoundError, InternalError } from "../utils/errors";
import { Station, Route } from "../prisma/models";
import { TransportMode } from "../shared/transport-mode.dto";

describe("ReachabilityService", () => {
  let service: ReachabilityService;
  let stationOrm: jest.Mocked<StationOrmService>;
  let routeOrm: jest.Mocked<RouteOrmService>;

  beforeEach(() => {
    stationOrm = {
      findOne: jest.fn(),
      findMany: jest.fn(),
      findByName: jest.fn(),
      findByRadius: jest.fn(),
      upsertStations: jest.fn(),
    } as unknown as jest.Mocked<StationOrmService>;
    routeOrm = {
      findRoutesByStation: jest.fn(),
      findRouteById: jest.fn(),
      findAllRoutes: jest.fn(),
      findRouteStopsByStation: jest.fn(),
      findRouteStopsByRoute: jest.fn(),
      findRouteByIdSimple: jest.fn(),
      upsertRouteWithStops: jest.fn(),
    } as unknown as jest.Mocked<RouteOrmService>;
    service = new ReachabilityService(stationOrm, routeOrm);
  });

  it("returns NotFoundError if origin station not found", async () => {
    stationOrm.findOne.mockResolvedValue(null);
    const result = await service.calculateReachableStations("origin", 2);
    if (result.success) throw new Error("Expected error result");
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it("returns no reachable stations if no routes from origin", async () => {
    stationOrm.findOne.mockResolvedValue({
      id: "origin",
      fullName: "Origin",
      transportMode: TransportMode.Train,
      latitude: 0,
      longitude: 0,
      country: null,
      region: null,
    });
    routeOrm.findRouteStopsByStation.mockResolvedValue([]);
    const result = await service.calculateReachableStations("origin", 2);
    if (!result.success) throw new Error("Expected success result");
    expect(result.data.reachableStations).toHaveLength(0);
  });

  it("finds reachable stations in a simple network", async () => {
    // origin --(route1)--> A --(route2)--> B
    const origin: Station = {
      id: "origin",
      fullName: "Origin",
      transportMode: TransportMode.Train,
      latitude: 0,
      longitude: 0,
      country: null,
      region: null,
    };
    const stationA: Station = {
      id: "A",
      fullName: "A",
      transportMode: TransportMode.Train,
      latitude: 1,
      longitude: 1,
      country: null,
      region: null,
    };
    const stationB: Station = {
      id: "B",
      fullName: "B",
      transportMode: TransportMode.Train,
      latitude: 2,
      longitude: 2,
      country: null,
      region: null,
    };
    const route1: Route = {
      id: "route1",
      shortTitle: "R1",
      fullTitle: "Route 1",
      transportMode: TransportMode.Train,
      routeInfoUrl: null,
    };
    const route2: Route = {
      id: "route2",
      shortTitle: "R2",
      fullTitle: "Route 2",
      transportMode: TransportMode.Train,
      routeInfoUrl: null,
    };
    // Mock DB
    stationOrm.findOne.mockImplementation(async (id: string) => {
      if (id === "origin") return origin;
      if (id === "A") return stationA;
      if (id === "B") return stationB;
      return null;
    });
    // origin is on route1
    routeOrm.findRouteStopsByStation.mockImplementation(
      async (stationId: string) => {
        if (stationId === "origin")
          return [
            { routeId: "route1", stationId: "origin", id: 1, stopPosition: 0 },
          ];
        if (stationId === "A")
          return [
            { routeId: "route1", stationId: "A", id: 2, stopPosition: 1 },
            { routeId: "route2", stationId: "A", id: 3, stopPosition: 0 },
          ];
        if (stationId === "B")
          return [
            { routeId: "route2", stationId: "B", id: 4, stopPosition: 1 },
          ];
        return [];
      },
    );
    // route1: origin, A
    routeOrm.findRouteStopsByRoute.mockImplementation(
      async (routeId: string) => {
        if (routeId === "route1")
          return [
            { routeId: "route1", stationId: "origin", id: 1, stopPosition: 0 },
            { routeId: "route1", stationId: "A", id: 2, stopPosition: 1 },
          ];
        if (routeId === "route2")
          return [
            { routeId: "route2", stationId: "A", id: 3, stopPosition: 0 },
            { routeId: "route2", stationId: "B", id: 4, stopPosition: 1 },
          ];
        return [];
      },
    );
    routeOrm.findRouteByIdSimple.mockImplementation(async (routeId: string) => {
      if (routeId === "route1") return route1;
      if (routeId === "route2") return route2;
      return null;
    });
    const result = await service.calculateReachableStations("origin", 2);
    if (!result.success) throw new Error("Expected success result");
    const stations = result.data.reachableStations;
    expect(
      stations.map((s: (typeof stations)[0]) => s.station.id).sort(),
    ).toEqual(["A", "B"]);
    const a = stations.find((s: (typeof stations)[0]) => s.station.id === "A");
    const b = stations.find((s: (typeof stations)[0]) => s.station.id === "B");
    expect(a?.transferCount).toBe(0);
    expect(b?.transferCount).toBe(1);
  });

  it("handles cycles/loops in the network", async () => {
    // origin --(route1)--> A --(route1)--> origin (cycle)
    const origin: Station = {
      id: "origin",
      fullName: "Origin",
      transportMode: TransportMode.Train,
      latitude: 0,
      longitude: 0,
      country: null,
      region: null,
    };
    const stationA: Station = {
      id: "A",
      fullName: "A",
      transportMode: TransportMode.Train,
      latitude: 1,
      longitude: 1,
      country: null,
      region: null,
    };
    const route1: Route = {
      id: "route1",
      shortTitle: "R1",
      fullTitle: "Route 1",
      transportMode: TransportMode.Train,
      routeInfoUrl: null,
    };
    stationOrm.findOne.mockImplementation(async (id: string) => {
      if (id === "origin") return origin;
      if (id === "A") return stationA;
      return null;
    });
    routeOrm.findRouteStopsByStation.mockImplementation(
      async (stationId: string) => {
        if (stationId === "origin")
          return [
            { routeId: "route1", stationId: "origin", id: 1, stopPosition: 0 },
          ];
        if (stationId === "A")
          return [
            { routeId: "route1", stationId: "A", id: 2, stopPosition: 1 },
          ];
        return [];
      },
    );
    routeOrm.findRouteStopsByRoute.mockImplementation(
      async (routeId: string) => {
        if (routeId === "route1")
          return [
            { routeId: "route1", stationId: "origin", id: 1, stopPosition: 0 },
            { routeId: "route1", stationId: "A", id: 2, stopPosition: 1 },
          ];
        return [];
      },
    );
    routeOrm.findRouteByIdSimple.mockImplementation(async (routeId: string) => {
      if (routeId === "route1") return route1;
      return null;
    });
    const result = await service.calculateReachableStations("origin", 2);
    if (!result.success) throw new Error("Expected success result");
    const stations = result.data.reachableStations;
    expect(stations.map((s: (typeof stations)[0]) => s.station.id)).toContain(
      "A",
    );
    // Should not loop infinitely or revisit origin
    expect(
      stations.map((s: (typeof stations)[0]) => s.station.id),
    ).not.toContain("origin");
  });
});
