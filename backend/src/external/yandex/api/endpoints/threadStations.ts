import { z } from "zod"
import type { Result } from "../../utils/result"
import { makeYandexApiRequest } from "../../utils/api-helpers"
import { threadSchema, intervalSchema } from "../baseSchemas"
import { threadStopSchema } from "../baseSchemas"

export const threadStationsParamsSchema = z.object({
  uid: z.string().max(100).describe("Thread identifier in Yandex Schedule system"),
  from: z.string().optional().describe("Departure station code in specified coding system"),
  to: z.string().optional().describe("Arrival station code in specified coding system"),
  format: z.enum(["json", "xml"]).optional().default("json").describe("Response format (json/xml)"),
  lang: z.enum(["ru_RU", "uk_UA"]).optional().default("ru_RU").describe("Response language code"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Thread date in YYYY-MM-DD format"),
  show_systems: z.enum(["yandex", "esr", "all"]).optional().describe("Station coding systems to include in response"),
})

export const threadStationsResponseSchema = z.object({
  except_days: z.string().describe("Days when thread does not run"),
  arrival_date: z.string().nullable().describe("Arrival date at destination"),
  from: z.string().nullable().describe("Departure point code"),
  uid: z.string().max(100).describe("Thread identifier"),
  title: z.string().describe("Thread name with full station names"),
  interval: intervalSchema.optional().describe("Schedule interval for regular services"),
  departure_date: z.string().nullable().describe("Departure date from origin"),
  start_time: z.string().describe("Departure time from first station"),
  number: z.string().describe("Route number"),
  short_title: z.string().describe("Thread name with short station names"),
  days: z.string().describe("Service days description"),
  to: z.string().nullable().describe("Arrival point code"),
  carrier: threadSchema.shape.carrier,
  transport_type: threadSchema.shape.transport_type,
  stops: z.array(threadStopSchema).describe("List of stops in thread"),
  vehicle: z.string().nullable().describe("Vehicle name"),
  start_date: z.string().describe("First service date"),
  transport_subtype: threadSchema.shape.transport_subtype,
  express_type: threadSchema.shape.express_type,
})

export type ThreadStationsParams = z.infer<typeof threadStationsParamsSchema>
export type ThreadStationsResponse = z.infer<typeof threadStationsResponseSchema>

const THREAD_ENDPOINT = "thread"

/**
 * Fetches list of stations for a specific thread
 * @param params - Thread stations request parameters
 * @returns Result with thread stations data or error message
 * @example
 * \`\`\`
 * const result = await fetchThreadStations({
 *   uid: '038AA_tis',
 *   date: '2024-01-20',
 *   show_systems: 'all'
 * });
 *
 * if (result.success) {
 *   const threadData = result.data;
 *   // Process the thread data
 * } else {
 *   console.error(result.message);
 * }
 * \`\`\`
 */
export const fetchThreadStations = async (params: ThreadStationsParams): Promise<Result<ThreadStationsResponse>> => {
  return makeYandexApiRequest(THREAD_ENDPOINT, threadStationsResponseSchema, params)
}
