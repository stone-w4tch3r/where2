import { z } from "zod";
import { StationDto, StationSchema } from "@/types/station"; // Assuming StationDto might be part of RouteDto

// Placeholder - adjust according to actual backend DTO
export interface RouteDto {
  id: string;
  name: string;
  stations: StationDto[]; // Example: a route has multiple stations
  // Add other relevant fields
}

export const RouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  stations: z.array(StationSchema), // Example
  // Add other relevant Zod validations
});

export const RouteArraySchema = z.array(RouteSchema);
