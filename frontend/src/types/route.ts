import { z } from "zod";
import { StationSchema, StationDto } from "./station";

// Placeholder - adjust according to actual backend DTO
export interface RouteDto {
  id: string;
  shortTitle: string;
  fullTitle: string;
  transportMode:
    | "train"
    | "suburban"
    | "bus"
    | "tram"
    | "metro"
    | "water"
    | "helicopter"
    | "plane"
    | "sea";
  routeInfoUrl: string | null;
  stops: StationDto[];
}

export const RouteSchema = z.object({
  id: z.string(),
  shortTitle: z.string(),
  fullTitle: z.string(),
  transportMode: z.enum([
    "train",
    "suburban",
    "bus",
    "tram",
    "metro",
    "water",
    "helicopter",
    "plane",
    "sea",
  ]),
  routeInfoUrl: z.string().nullable(),
  stops: z.array(StationSchema),
});

export const RouteArraySchema = z.array(RouteSchema);
