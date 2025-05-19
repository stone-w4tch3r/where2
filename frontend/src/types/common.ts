import { z } from "zod";

export const BackendTransportModeSchema = z.enum([
  "train",
  "suburban",
  "bus",
  "tram",
  "metro",
  "water",
  "helicopter",
  "plane",
  "sea",
]);

export type BackendTransportMode = z.infer<typeof BackendTransportModeSchema>;
