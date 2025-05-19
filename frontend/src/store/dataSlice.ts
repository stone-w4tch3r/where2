import { StateCreator } from "zustand/vanilla";
import { StationDto } from "@/types/station";
import { RouteDto } from "@/types/route";
import { ScheduleDto } from "@/types/schedule"; // Assuming ScheduleDto exists
import { ReachableStationsDto } from "@/types/reachability";

export interface DataSlice {
  stations: StationDto[];
  routes: RouteDto[];
  schedules: ScheduleDto[]; // Plural as per spec, though useSchedule is singular
  reachableStations: ReachableStationsDto; // This was StationDto[] in frontArch.md

  // Actions for hydrating data - typically called from React Query onSuccess
  // For now, as per "no logic yet", these are placeholders if needed
  // Or we can omit actions entirely if data is purely set from outside.
  // The spec says "DataSlice mirrors the server entities and is readonly; it is hydrated exclusively inside React‑Query onSuccess callbacks"
  // This implies no direct setter actions in the slice itself for external use.
  // However, Zustand needs functions to update its state.
  // So, these actions would be internal or used by the hydration mechanism.

  // Example of how hydration might look (not for direct user calls from components)
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
  reachableStations: [], // Default to empty array

  setStations: (stations) => set(() => ({ stations })),
  setRoutes: (routes) => set(() => ({ routes })),
  setSchedules: (schedules) => set(() => ({ schedules })),
  setReachableStations: (stations) =>
    set(() => ({ reachableStations: stations })),
});
