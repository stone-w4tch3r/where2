import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { axiosClient } from "@/api/client";
import { StationArraySchema, StationDto } from "@/types/station";
import {
  BackendTransportMode,
  BackendTransportModeSchema,
} from "@/types/common";
import { z } from "zod";

export const StationQuerySchema = z.object({
  country: z.string().optional(),
  region: z.string().optional(),
  minLat: z.number().optional(),
  maxLat: z.number().optional(),
  minLon: z.number().optional(),
  maxLon: z.number().optional(),
  transportMode: BackendTransportModeSchema.optional(),
});

export type StationQuery = z.infer<typeof StationQuerySchema>;

export const useStationsQuery = (
  params: StationQuery,
): UseQueryResult<StationDto[], Error> => {
  return useQuery<unknown[], Error, StationDto[]>({
    queryKey: ["stations", params],
    queryFn: async () => {
      const response = await axiosClient.get<unknown[]>("/stations", {
        params,
      });
      return response.data;
    },
    select: (data: unknown[]) => {
      const parsed = StationArraySchema.parse(data);
      return parsed;
    },
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 30 * 60 * 1000, // 30 min, formerly cacheTime in v4
  });
};
