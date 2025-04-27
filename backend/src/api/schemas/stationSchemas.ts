import { z } from "zod"
import { TransportMode } from "../../domain/valueObjects"

export const stationResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  popularName: z.string().nullable(),
  shortName: z.string().nullable(),
  transportMode: z.nativeEnum(TransportMode),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  country: z.string(),
  region: z.string(),
})

export const stationsResponseSchema = z.object({
  stations: z.array(stationResponseSchema),
})

export type StationResponse = z.infer<typeof stationResponseSchema>
export type StationsResponse = z.infer<typeof stationsResponseSchema>
