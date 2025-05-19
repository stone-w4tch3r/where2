import { z } from "zod";

export interface StationDto {
  id: string;
  fullName: string;
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
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  region: string | null;
}

export const StationSchema = z.object({
  id: z.string(),
  fullName: z.string(),
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
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  country: z.string().nullable(),
  region: z.string().nullable(),
});

export const StationArraySchema = z.array(StationSchema);
