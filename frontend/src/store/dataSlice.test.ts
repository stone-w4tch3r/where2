import { describe, it, expect, vi } from "vitest";
import { type DataSlice, createDataSlice } from "./dataSlice";
import { StationDto } from "@/types/station";
import { RouteDto } from "@/types/route";
import { ScheduleDto } from "@/types/schedule";
import { ReachableStationsDto } from "@/types/reachability";

type SetDataSlice = (
  updater: (prevState: DataSlice) => Partial<DataSlice>,
) => void;

const getInitialState = (): DataSlice => {
  const initialState = createDataSlice(
    vi.fn<Parameters<SetDataSlice>, ReturnType<SetDataSlice>>(),
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
    const set = vi.fn<Parameters<SetDataSlice>, ReturnType<SetDataSlice>>();
    const slice = createDataSlice(set);
    const mockStations: StationDto[] = [
      {
        id: "1",
        fullName: "Station 1",
        latitude: 0,
        longitude: 0,
        popularName: "",
        shortName: "",
      },
    ];
    slice.setStations(mockStations);
    expect(set).toHaveBeenCalledWith(expect.any(Function));
    const updater = set.mock.calls[0][0];
    expect(updater({} as DataSlice)).toEqual({ stations: mockStations });
  });

  it("setRoutes should update routes state", (): void => {
    const set = vi.fn<Parameters<SetDataSlice>, ReturnType<SetDataSlice>>();
    const slice = createDataSlice(set);
    const mockRoutes: RouteDto[] = [
      {
        id: "r1",
        name: "Route 1",
        anfangsstationId: "s1",
        endstationId: "s2",
        stations: [],
      },
    ];
    slice.setRoutes(mockRoutes);
    const updater = set.mock.calls[0][0];
    expect(updater({} as DataSlice)).toEqual({ routes: mockRoutes });
  });

  it("setSchedules should update schedules state", (): void => {
    const set = vi.fn<Parameters<SetDataSlice>, ReturnType<SetDataSlice>>();
    const slice = createDataSlice(set);
    const mockSchedules: ScheduleDto[] = [
      { id: "s1", stationId: "st1", ankunft: [], abfahrt: [], gleis: [] },
    ];
    slice.setSchedules(mockSchedules);
    const updater = set.mock.calls[0][0];
    expect(updater({} as DataSlice)).toEqual({ schedules: mockSchedules });
  });

  it("setReachableStations should update reachableStations state", (): void => {
    const set = vi.fn<Parameters<SetDataSlice>, ReturnType<SetDataSlice>>();
    const slice = createDataSlice(set);
    const mockReachable: ReachableStationsDto = [
      {
        id: "2",
        fullName: "Station 2",
        latitude: 0,
        longitude: 0,
        popularName: "",
        shortName: "",
      },
    ];
    slice.setReachableStations(mockReachable);
    const updater = set.mock.calls[0][0];
    expect(updater({} as DataSlice)).toEqual({
      reachableStations: mockReachable,
    });
  });
});
