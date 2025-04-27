import prismaClient from "../db/client"
import { Station } from "../domain/entities"
import { StationId, Coordinates, type TransportMode } from "../domain/valueObjects"
import { type Result, createSuccess, createFailure } from "../external/yandex/utils/result"

export class StationRepository {
  /**
   * Saves a station to the database
   */
  async save(station: Station): Promise<Result<Station>> {
    try {
      await prismaClient.station.upsert({
        where: { id: station.id.value },
        update: {
          fullName: station.fullName,
          popularName: station.popularName,
          shortName: station.shortName,
          transportMode: station.mode,
          latitude: station.location.latitude,
          longitude: station.location.longitude,
          country: station.country,
          region: station.region,
        },
        create: {
          id: station.id.value,
          fullName: station.fullName,
          popularName: station.popularName,
          shortName: station.shortName,
          transportMode: station.mode,
          latitude: station.location.latitude,
          longitude: station.location.longitude,
          country: station.country,
          region: station.region,
        },
      })

      return createSuccess(station)
    } catch (error) {
      return createFailure(`Failed to save station: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Finds a station by its ID
   */
  async findById(id: StationId): Promise<Result<Station | null>> {
    try {
      const stationData = await prismaClient.station.findUnique({
        where: { id: id.value },
      })

      if (!stationData) {
        return createSuccess(null)
      }

      const station = new Station(
        new StationId(stationData.id),
        stationData.fullName,
        stationData.popularName,
        stationData.shortName,
        stationData.transportMode as TransportMode,
        new Coordinates(stationData.latitude, stationData.longitude),
        stationData.country,
        stationData.region,
      )

      return createSuccess(station)
    } catch (error) {
      return createFailure(`Failed to find station: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Finds all stations
   */
  async findAll(): Promise<Result<Station[]>> {
    try {
      const stationsData = await prismaClient.station.findMany()

      const stations = stationsData.map(
        (stationData) =>
          new Station(
            new StationId(stationData.id),
            stationData.fullName,
            stationData.popularName,
            stationData.shortName,
            stationData.transportMode as TransportMode,
            new Coordinates(stationData.latitude, stationData.longitude),
            stationData.country,
            stationData.region,
          ),
      )

      return createSuccess(stations)
    } catch (error) {
      return createFailure(`Failed to find stations: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Finds stations by region
   */
  async findByRegion(region: string): Promise<Result<Station[]>> {
    try {
      const stationsData = await prismaClient.station.findMany({
        where: { region },
      })

      const stations = stationsData.map(
        (stationData) =>
          new Station(
            new StationId(stationData.id),
            stationData.fullName,
            stationData.popularName,
            stationData.shortName,
            stationData.transportMode as TransportMode,
            new Coordinates(stationData.latitude, stationData.longitude),
            stationData.country,
            stationData.region,
          ),
      )

      return createSuccess(stations)
    } catch (error) {
      return createFailure(
        `Failed to find stations by region: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
