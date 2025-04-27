import { z } from "zod"
import type { Result } from "../../utils/result"
import { makeYandexApiRequest } from "../../utils/api-helpers"
import { paginationSchema, searchInfoSchema, segmentSchema } from "../baseSchemas"

export const betweenStationsScheduleParamsSchema = z.object({
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
})
export type BetweenStationsScheduleParams = z.infer<typeof betweenStationsScheduleParamsSchema>

export const betweenStationsScheduleResponseSchema = z.object({
  pagination: paginationSchema,
  segments: z.array(segmentSchema).describe("List of found routes"),
  interval_segments: z.array(segmentSchema).describe("List of interval routes without fixed schedule"),
  search: searchInfoSchema,
})

export type BetweenStationsScheduleResponse = z.infer<typeof betweenStationsScheduleResponseSchema>

const SEARCH_ENDPOINT = "search"

/**
 * Fetches schedule between stations
 * @param params - Schedule search parameters
 * @returns Result with schedule data or error message
 * @example
 * \`\`\`
 * const result = await fetchSchedule({
 *   from: 's9600396', // Simferopol
 *   to: 's9600213',   // Sheremetyevo
 *   date: '2024-01-20'
 * });
 *
 * if (result.success) {
 *   const scheduleData = result.data;
 *   // Process the schedule data
 * } else {
 *   console.error(result.message);
 * }
 * \`\`\`
 */
export const fetchSchedule = async (
  params: BetweenStationsScheduleParams,
): Promise<Result<BetweenStationsScheduleResponse>> => {
  return makeYandexApiRequest(SEARCH_ENDPOINT, betweenStationsScheduleResponseSchema, params)
}
