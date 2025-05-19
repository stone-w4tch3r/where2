import { z } from "zod";

export const ClientTransportModeSchema = z.enum(["train", "suburban"]);
export type ClientTransportMode = z.infer<typeof ClientTransportModeSchema>;

export const StationSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  transportMode: ClientTransportModeSchema,
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().nullable(),
  region: z.string().nullable(),
});

export type StationDto = z.infer<typeof StationSchema>;

export const StationArraySchema = z.array(StationSchema);
