import { z } from "zod"
import { TransportMode } from "../../domain/valueObjects"

export const routeResponseSchema = z.object({
  id: z.string(),
  shortTitle: z.string(),
  fullTitle: z.string(),
  transportMode: z.nativeEnum(TransportMode),
  routeInfoUrl: z.string(),
  stops: z.array(z.string()),
})

export const routesResponseSchema = z.object({
  routes: z.array(routeResponseSchema),
})

export const routesByStationRequestSchema = z.object({
  stationId: z.string(),
})

export type RouteResponse = z.infer<typeof routeResponseSchema>
export type RoutesResponse = z.infer<typeof routesResponseSchema>
export type RoutesByStationRequest = z.infer<typeof routesByStationRequestSchema>
