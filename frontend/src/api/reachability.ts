import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { axiosClient } from "@/api/client";
import {
  ReachabilityResultSchema,
  ReachabilityResultDto,
} from "@/types/reachability";
import { z } from "zod";

export const ReachabilityQuerySchema = z.object({
  stationId: z.string(),
  maxTransfers: z.number().min(0).max(3), // As per swagger: min 0, max 3. UI slice also 0-3.
});

export type ReachabilityQuery = z.infer<typeof ReachabilityQuerySchema>;

export const useReachabilityQuery = (
  params: ReachabilityQuery,
  options?: { enabled?: boolean },
): UseQueryResult<ReachabilityResultDto, Error> =>
  useQuery<unknown, Error, ReachabilityResultDto>({
    queryKey: ["reachability", params],
    queryFn: async () => {
      const response = await axiosClient.get<unknown>("/reachability", {
        params,
      });
      return response.data;
    },
    select: (data) => ReachabilityResultSchema.parse(data),
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 30 * 60 * 1000, // 30 min
    enabled: options?.enabled ?? true, // Allow disabling the query
  });
