import type { StationListItemContract, ThreadStationsResponse, StationScheduleResponse } from "../external/yandex/api"
import { Station, Route } from "../domain/entities"
import { StationId, RouteId, Coordinates, TransportMode } from "../domain/valueObjects"

/**
 * Maps Yandex transport type to our domain TransportMode
 */
export function mapTransportMode(yandexType: string): TransportMode {
  switch (yandexType) {
    case "train":
      return TransportMode.Train
    case "suburban":
      return TransportMode.Suburban
    case "bus":
      return TransportMode.Bus
    default:
      // Default to train for unknown types
      return TransportMode.Train
  }
}

/**
 * Maps a Yandex station to our domain Station
 */
export function mapToStation(stationData: StationListItemContract, country: string, region: string): Station | null {
  // Skip stations with invalid coordinates
  if (stationData.latitude === "" || stationData.longitude === "") {
    return null
  }

  try {
    const stationId = new StationId(stationData.codes.yandex_code)
    const coordinates = new Coordinates(Number(stationData.latitude), Number(stationData.longitude))
    const transportMode = mapTransportMode(stationData.transport_type)

    return new Station(
      stationId,
      stationData.title,
      null, // popularName is not available in this context
      null, // shortName is not available in this context
      transportMode,
      coordinates,
      country,
      region,
    )
  } catch (error) {
    console.error("Error mapping station:", error)
    return null
  }
}

/**
 * Maps a Yandex thread to our domain Route
 */
export function mapToRoute(threadData: ThreadStationsResponse): Route | null {
  try {
    const routeId = new RouteId(threadData.uid)
    const transportMode = mapTransportMode(threadData.transport_type)

    // Extract stops as StationIds
    const stops = threadData.stops.map((stop) => new StationId(stop.station.code))

    // Construct route info URL if available
    const routeInfoUrl = threadData.carrier.thread_method_link || ""

    return new Route(routeId, threadData.short_title, threadData.title, transportMode, routeInfoUrl, stops)
  } catch (error) {
    console.error("Error mapping route:", error)
    return null
  }
}

/**
 * Extracts thread UIDs from station schedule
 */
export function extractThreadUids(scheduleData: StationScheduleResponse): string[] {
  const uids = new Set<string>()

  // Extract from regular schedule
  scheduleData.schedule.forEach((item) => {
    uids.add(item.thread.uid)
  })

  // Extract from interval schedule
  scheduleData.interval_schedule.forEach((item) => {
    uids.add(item.thread.uid)
  })

  return Array.from(uids)
}
