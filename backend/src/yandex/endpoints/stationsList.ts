import { z } from "zod";
import { Result } from "../../utils/Result";
import { countrySchema } from "../baseSchemas";
import { AppError } from "../../utils/errors";
import { makeApiRequest } from "../utils/apiRequest";

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

export type StationsListResponse = z.infer<typeof stationsListResponseSchema>;

const STATIONS_LIST_ENDPOINT = "stations_list";

/**
 * Fetches complete stations list
 * Note: Response is about 40MB in size, use with caution
 * @param params - Request parameters
 * @param config - Configuration object
 * @returns Result with stations list data or error message
 * @example
 * ```
 * const result = await fetchStationsList({
 *   lang: 'ru_RU',
 *   format: 'json'
 * }, {
 *   baseUrl: 'https://yandex.ru/api/',
 *   apiKey: 'your-api-key',
 *   defaultParams: {}
 * });
 *
 * if (result.success) {
 *   const stationsData = result.data;
 *   // Do something with the data
 * } else {
 *   console.error(result.message);
 * }
 * ```
 */
export const fetchStationsList = async (
  params: StationsListParams,
  config: {
    baseUrl: string;
    apiKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultParams: Record<string, any>;
  },
): Promise<Result<StationsListResponse, AppError>> => {
  return makeApiRequest(
    STATIONS_LIST_ENDPOINT,
    params,
    stationsListResponseSchema,
    config,
  );
};
