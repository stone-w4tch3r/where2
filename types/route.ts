import type { TransportMode } from "./station"

export interface Route {
  id: string
  shortTitle: string
  fullTitle: string
  transportMode: TransportMode
  routeInfoUrl: string
  stops: string[]
}
