import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { axiosClient } from "@/api/client";
import { RouteArraySchema, RouteDto } from "@/types/route";
import {
  BackendTransportMode,
  BackendTransportModeSchema,
} from "@/types/common";
import { z } from "zod";

export const RoutesQuerySchema = z.object({
  stationId: z.string().optional(),
  transportMode: BackendTransportModeSchema.optional(),
});

export type RoutesQuery = z.infer<typeof RoutesQuerySchema>;

export const useRoutesQuery = (
  params?: RoutesQuery,
): UseQueryResult<RouteDto[], Error> =>
  useQuery<unknown[], Error, RouteDto[]>({
    queryKey: ["routes", params],
    queryFn: async () => {
      let url = "/routes";
      const queryParams: Record<string, string> = {};

      if (params?.stationId) {
        url = `/routes/by-station/${params.stationId}`;
        // stationId is part of the path, no need to add to queryParams for this specific key
      } else if (params?.transportMode) {
        queryParams.transportMode = params.transportMode;
      }

      // Add any other potential params from RoutesQuery to queryParams if url is still /routes
      if (url === "/routes" && params) {
        if (params.transportMode)
          queryParams.transportMode = params.transportMode;
        // add other params if RoutesQuery expands
      }

      const response = await axiosClient.get<unknown[]>(url, {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      });
      return response.data;
    },
    select: (data) => RouteArraySchema.parse(data),
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 30 * 60 * 1000, // 30 min
  });
