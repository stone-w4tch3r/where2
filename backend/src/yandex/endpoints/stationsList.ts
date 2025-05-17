import { z } from "zod";
import { Result, resultSuccess, resultError } from "../../utils/Result";
import { countrySchema } from "../baseSchemas";
import { getErrorMessage } from "../../utils/errorHelpers";

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
): Promise<Result<StationsListResponse>> => {
  const axios = (await import("axios")).default;
  const { baseUrl, apiKey, defaultParams } = config;
  try {
    const response = await axios.get(baseUrl + "stations_list", {
      params: {
        apikey: apiKey,
        ...defaultParams,
        ...params,
      },
    });
    const parsedData = stationsListResponseSchema.parse(response.data);
    return resultSuccess(parsedData);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return resultError(message);
  }
};
