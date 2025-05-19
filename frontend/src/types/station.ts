import { z } from "zod";

export interface StationDto {
  id: string;
  fullName: string;
  transportMode: "train" | "suburban";
  latitude: number;
  longitude: number;
  country: string | null;
  region: string | null;
}

export const StationSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  transportMode: z.enum(["train", "suburban"]),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().nullable(),
  region: z.string().nullable(),
});

export const StationArraySchema = z.array(StationSchema);
