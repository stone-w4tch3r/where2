import { StateCreator } from "zustand/vanilla";
import { StationDto } from "@/types/station";
import { RouteDto } from "@/types/route";
import { ScheduleDto } from "@/types/schedule";
import { ReachableStationsDto } from "@/types/reachability";

export interface DataSlice {
  stations: StationDto[];
  routes: RouteDto[];
  schedules: ScheduleDto[];
  reachableStations: ReachableStationsDto;

  setStations: (stations: StationDto[]) => void;
  setRoutes: (routes: RouteDto[]) => void;
  setSchedules: (schedules: ScheduleDto[]) => void;
  setReachableStations: (stations: ReachableStationsDto) => void;
}

export const createDataSlice: StateCreator<DataSlice, [], [], DataSlice> = (
  set,
) => ({
  stations: [],
  routes: [],
  schedules: [],
  reachableStations: [],

  setStations: (stations) => set(() => ({ stations })),
  setRoutes: (routes) => set(() => ({ routes })),
  setSchedules: (schedules) => set(() => ({ schedules })),
  setReachableStations: (stations) =>
    set(() => ({ reachableStations: stations })),
});
