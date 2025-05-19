import { z } from "zod";
import { StationDto, StationArraySchema } from "@/types/station";
import { StationSchema } from "./station";

// As per frontArch.md, useReachableStations returns StationDto[]
// This type might be directly StationDto[] or an object containing it.
// For simplicity, let's assume the API returns StationDto[] directly for reachability.

export type ReachableStationsDto = StationDto[];

export const ReachableStationsSchema = StationArraySchema; // Reusing from station.ts

export interface ReachabilityResultDto {
  origin: string;
  maxTransfers: number;
  totalCount: number;
  reachableStations: StationDto[];
}

export const ReachabilityResultSchema = z.object({
  origin: z.string(),
  maxTransfers: z.number(),
  totalCount: z.number(),
  reachableStations: z.array(StationSchema),
});

export const ReachabilityResultArraySchema = z.array(ReachabilityResultSchema);
