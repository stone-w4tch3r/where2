import type { Station } from "@/types/station"
import type { Route } from "@/types/route"
import type { ReachabilityResult } from "@/types/reachability"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

/**
 * Fetches all stations
 */
export async function fetchStations(): Promise<Station[]> {
  const response = await fetch(`${API_BASE_URL}/stations`)
  if (!response.ok) {
    throw new Error(`Failed to fetch stations: ${response.statusText}`)
  }
  const data = await response.json()
  return data.stations
}

/**
 * Fetches routes by station ID
 */
export async function fetchRoutesByStationId(stationId: string): Promise<Route[]> {
  const response = await fetch(`${API_BASE_URL}/routes?stationId=${encodeURIComponent(stationId)}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch routes: ${response.statusText}`)
  }
  const data = await response.json()
  return data.routes
}

/**
 * Calculates reachability from a station
 */
export async function calculateReachability(stationId: string, maxTransfers: number): Promise<ReachabilityResult> {
  const response = await fetch(
    `${API_BASE_URL}/reachability?stationId=${encodeURIComponent(stationId)}&maxTransfers=${maxTransfers}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to calculate reachability: ${response.statusText}`)
  }
  return await response.json()
}
