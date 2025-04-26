// stations-list-schemas.ts
import axios from "axios";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { countrySchema } from "../base-schemas";

export const stationsListParamsSchema = z.object({
  /** Response language (e.g. "ru_RU", "uk_UA") */
  lang: z.string().optional(),
  /** Response format (json/xml) */
  format: z.enum(["json", "xml"]).optional(),
});

export type StationsListParams = z.infer<typeof stationsListParamsSchema>;

export const stationsListResponseSchema = z.object({
  countries: z
    .array(countrySchema)
    .transform((arr) => arr.filter((c) => c.codes.yandex_code !== undefined))
    .describe("List of countries with stations"),
});

const fetchStationsList = async (
  apiKey: string,
  params?: StationsListParams
) => {
  const response = await axios.get(
    "https://api.rasp.yandex.net/v3.0/stations_list/",
    {
      params: {
        apikey: apiKey,
        ...params,
      },
    }
  );
  return stationsListResponseSchema.parse(response.data);
};

/**
 * React Query hook for fetching complete stations list
 * Note: Response is about 40MB in size, use with caution
 * @param apiKey - Yandex Schedule API key
 * @param params - Request parameters
 * @example
 * ```
 * const { data, isLoading, error } = useStationsList('your-api-key', {
 *   lang: 'ru_RU',
 *   format: 'json'
 * })
 * ```
 */
export const useStationsList = (
  apiKey: string,
  params?: StationsListParams
) => {
  return useQuery({
    queryKey: ["stationsList", params],
    queryFn: () => fetchStationsList(apiKey, params),
    staleTime: 24 * 60 * 60 * 1000, // Consider data stale after 24 hours
  });
};
