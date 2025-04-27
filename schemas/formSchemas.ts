import { z } from "zod"

export const routesByStationSchema = z.object({
  stationId: z.string().min(1, "Station ID is required"),
})

export const reachabilitySchema = z.object({
  stationId: z.string().min(1, "Station ID is required"),
  maxTransfers: z.number().int().min(0, "Must be a non-negative integer"),
})

export type RoutesByStationFormValues = z.infer<typeof routesByStationSchema>
export type ReachabilityFormValues = z.infer<typeof reachabilitySchema>
