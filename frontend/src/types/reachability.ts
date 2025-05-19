import { z } from "zod";
import { StationDto, StationArraySchema } from "@/types/station";

export type ReachableStationsDto = StationDto[];

export const ReachableStationsSchema = StationArraySchema;

export const ReachabilityResultSchema = z.object({
  origin: z.string(),
  maxTransfers: z.number(),
  totalCount: z.number(),
  reachableStations: StationArraySchema,
});

export type ReachabilityResultDto = z.infer<typeof ReachabilityResultSchema>;

export const ReachabilityResultArraySchema = z.array(ReachabilityResultSchema);
