import { z } from "zod";
import { StationSchema, ClientTransportModeSchema } from "@/types/station";

export const RouteSchema = z.object({
  id: z.string(),
  shortTitle: z.string(),
  fullTitle: z.string(),
  transportMode: ClientTransportModeSchema,
  routeInfoUrl: z.string().url().nullable(),
  stops: z.array(StationSchema),
});

export type RouteDto = z.infer<typeof RouteSchema>;

export const RouteArraySchema = z.array(RouteSchema);
