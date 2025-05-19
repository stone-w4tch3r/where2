import { describe, it, expect, vi } from "vitest";
import { type DataSlice, createDataSlice } from "./dataSlice";

const getInitialState = (): DataSlice => {
  const initialState = createDataSlice(
    vi.fn() as any,
    vi.fn() as any,
    vi.fn() as any,
  );
  return initialState;
};

describe("dataSlice", (): void => {
  it("should have correct default state", (): void => {
    const initialState = getInitialState();
    expect(initialState.stations).toEqual([]);
    expect(initialState.routes).toEqual([]);
    expect(initialState.schedules).toEqual([]);
    expect(initialState.reachableStations).toEqual([]);
  });

  it("setStations should update stations state", (): void => {
    const set = vi.fn();
    const slice = createDataSlice(set as any, vi.fn() as any, vi.fn() as any);
    const mockStations = [{ id: "1", fullName: "Station 1" }];
    slice.setStations(mockStations as any);
    expect(set).toHaveBeenCalledWith(expect.any(Function));
    const updater = set.mock.calls[0][0];
    expect(updater({} as DataSlice)).toEqual({ stations: mockStations });
  });

  it("setRoutes should update routes state", (): void => {
    const set = vi.fn();
    const slice = createDataSlice(set as any, vi.fn() as any, vi.fn() as any);
    const mockRoutes = [{ id: "r1", name: "Route 1" }];
    slice.setRoutes(mockRoutes as any);
    const updater = set.mock.calls[0][0];
    expect(updater({} as DataSlice)).toEqual({ routes: mockRoutes });
  });

  it("setSchedules should update schedules state", (): void => {
    const set = vi.fn();
    const slice = createDataSlice(set as any, vi.fn() as any, vi.fn() as any);
    const mockSchedules = [{ id: "s1", stationId: "st1" }];
    slice.setSchedules(mockSchedules as any);
    const updater = set.mock.calls[0][0];
    expect(updater({} as DataSlice)).toEqual({ schedules: mockSchedules });
  });

  it("setReachableStations should update reachableStations state", (): void => {
    const set = vi.fn();
    const slice = createDataSlice(set as any, vi.fn() as any, vi.fn() as any);
    const mockReachable = [{ id: "2", fullName: "Station 2" }];
    slice.setReachableStations(mockReachable as any);
    const updater = set.mock.calls[0][0];
    expect(updater({} as DataSlice)).toEqual({
      reachableStations: mockReachable,
    });
  });
});
