import { z } from "zod"

export const reachabilityRequestSchema = z.object({
  stationId: z.string(),
  maxTransfers: z.number().int().min(0).default(0),
})

export const reachabilityResponseSchema = z.object({
  origin: z.string(),
  usedTransfers: z.number(),
  reachableStations: z.array(z.string()),
  connectedRoutes: z.array(z.string()),
})

export type ReachabilityRequest = z.infer<typeof reachabilityRequestSchema>
export type ReachabilityResponse = z.infer<typeof reachabilityResponseSchema>
