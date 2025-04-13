import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { paginationSchema, searchInfoSchema, segmentSchema } from "../base-schemas";

const betweenStationsScheduleParamsSchema = z.object({
  /** From station code */
  from: z.string(),
  /** To station code */
  to: z.string(),
  /** Date in YYYY-MM-DD format */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  /** Results offset */
  offset: z.number().optional(),
  /** Results per page */
  limit: z.number().optional(),
  /** Show interval routes */
  show_intervals: z.boolean().optional(),
});
type BetweenStationsScheduleParams = z.infer<typeof betweenStationsScheduleParamsSchema>;

const betweenStationsScheduleResponseSchema = z.object({
  pagination: paginationSchema,
  segments: z.array(segmentSchema).describe("List of found routes"),
  interval_segments: z
    .array(segmentSchema)
    .describe("List of interval routes without fixed schedule"),
  search: searchInfoSchema,
});

const fetchSchedule = async (
  apiKey: string,
  params: BetweenStationsScheduleParams
) => {
  const response = await axios.get("https://api.rasp.yandex.net/v3.0/search/", {
    params: {
      apikey: apiKey,
      ...params,
    },
  });
  return betweenStationsScheduleResponseSchema.parse(response.data);
};

/**
 * React Query hook for fetching schedule between stations
 * @param apiKey - Yandex Schedule API key
 * @param params - Schedule search parameters
 * @example
 * ```
 * const { data, isLoading, error } = useSchedule('your-api-key', {
 *   from: 's9600396', // Simferopol
 *   to: 's9600213',   // Sheremetyevo
 *   date: '2024-01-20'
 * })
 * ```
 */
export const useSchedule = (
  apiKey: string,
  params: BetweenStationsScheduleParams
) => {
  return useQuery({
    queryKey: ["schedule", params],
    queryFn: () => fetchSchedule(apiKey, params),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
};