import { z } from "zod";
import { Result } from "../../utils/result";
import { makeYandexApiRequest } from "../../utils/api-helpers";
import { countrySchema } from "../baseSchemas";

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

/**
 * Fetches complete stations list
 * Note: Response is about 40MB in size, use with caution
 * @param params - Request parameters
 * @returns Result with stations list data or error message
 * @example
 * ```
 * const result = await fetchStationsList({
 *   lang: 'ru_RU',
 *   format: 'json'
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
  params: StationsListParams
): Promise<Result<StationsListResponse>> => {
  return makeYandexApiRequest(
    "stations_list",
    stationsListResponseSchema,
    params
  );
};
