import { z } from "zod";
import { Result, resultSuccess, resultError } from "../../utils/Result";
import {
  paginationSchema,
  directionSchema,
  threadSchemaWithInterval,
  stationSchema,
} from "../baseSchemas";
import { getErrorMessage } from "../../utils/errorHelpers";

export const stationScheduleParamsSchema = z.object({
  station: z.string().describe("Station code"),
  lang: z.string().optional().describe("Response language (e.g. 'ru_RU')"),
  format: z
    .enum(["json", "xml"])
    .optional()
    .describe("Response format (json/xml)"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format"),
  transport_types: z
    .enum(["plane", "train", "suburban", "bus", "water", "helicopter"])
    .optional()
    .describe("Transport type filter"),
  event: z.enum(["departure", "arrival"]).optional().describe("Event filter"),
  system: z
    .enum(["yandex", "iata", "sirena", "express", "esr"])
    .optional()
    .describe("Station code system"),
  show_systems: z
    .enum(["yandex", "esr", "all"])
    .optional()
    .describe("Response code systems"),
  direction: z
    .string()
    .optional()
    .describe("Direction filter (for suburban only)"),
  result_timezone: z.string().optional().describe("Response timezone"),
});
export type StationScheduleParams = z.infer<typeof stationScheduleParamsSchema>;

export const stationScheduleResponseSchema = z.object({
  date: z
    .string()
    .nullable()
    .describe("Schedule date in YYYY-MM-DD format, null if not specified"),
  pagination: paginationSchema,
  station: stationSchema,
  schedule: z
    .array(
      z.object({
        except_days: z
          .string()
          .nullable()
          .describe("Days when service does not run"),
        arrival: z.string().nullable().describe("Arrival time in ISO 8601"),
        thread: threadSchemaWithInterval,
        is_fuzzy: z.boolean().describe("Whether times are approximate"),
        days: z.string().describe("Service days"),
        stops: z.string().max(1000).describe("Stops"),
        departure: z.string().describe("Departure time in ISO 8601"),
        terminal: z.string().nullable().describe("Airport terminal"),
        platform: z.string().describe("Platform or track number"),
      }),
    )
    .describe("List of scheduled services"),
  interval_schedule: z
    .array(
      z.object({
        except_days: z.string().nullable(),
        thread: threadSchemaWithInterval,
        is_fuzzy: z.boolean(),
        days: z.string(),
        stops: z.string().max(1000),
        terminal: z.string().nullable(),
        platform: z.string(),
      }),
    )
    .describe("List of interval-based services"),
  schedule_direction: directionSchema
    .optional()
    .describe("Requested direction info, if specified"),
  directions: z
    .array(directionSchema)
    .optional()
    .describe("Available directions for suburban trains"),
});

export type StationScheduleResponse = z.infer<
  typeof stationScheduleResponseSchema
>;

const SCHEDULE_ENDPOINT = "schedule";

/**
 * Fetches station schedule from Yandex.Rasp API
 * @param params - Schedule search parameters
 * @param config - Configuration object containing baseUrl, apiKey, and defaultParams
 * @returns Result with station schedule data or error message
 * @example
 * ```
 * const result = await fetchStationSchedule({
 *   station: 's9600213', // Sheremetyevo
 *   date: '2024-01-20',
 *   transport_types: 'plane',
 *   event: 'departure'
 * }, {
 *   baseUrl: 'https://rasp.yandex.net/',
 *   apiKey: 'your-api-key',
 *   defaultParams: {
 *     lang: 'ru_RU',
 *     format: 'json',
 *     result_timezone: 'Europe/Moscow'
 *   }
 * });
 *
 * if (result.success) {
 *   const scheduleData = result.data;
 *   // Process the schedule data
 * } else {
 *   console.error(result.message);
 * }
 * ```
 */
export const fetchStationSchedule = async (
  params: StationScheduleParams,
  config: {
    baseUrl: string;
    apiKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultParams: Record<string, any>;
  },
): Promise<Result<StationScheduleResponse>> => {
  const axios = (await import("axios")).default;
  const { baseUrl, apiKey, defaultParams } = config;
  try {
    const response = await axios.get(baseUrl + SCHEDULE_ENDPOINT, {
      params: {
        apikey: apiKey,
        ...defaultParams,
        ...params,
      },
    });
    const parsedData = stationScheduleResponseSchema.parse(response.data);
    return resultSuccess(parsedData);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return resultError(message);
  }
};
