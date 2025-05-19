import { z } from "zod";
import { StationDto, StationArraySchema } from "@/types/station";

// As per frontArch.md, useReachableStations returns StationDto[]
// This type might be directly StationDto[] or an object containing it.
// For simplicity, let's assume the API returns StationDto[] directly for reachability.

export type ReachableStationsDto = StationDto[];

export const ReachableStationsSchema = StationArraySchema; // Reusing from station.ts
