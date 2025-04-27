import type { Request, Response } from "express"
import type { StationService } from "../../services/stationService"
import { StationId } from "../../domain/valueObjects"
import type { StationResponse, StationsResponse } from "../schemas/stationSchemas"

export class StationController {
  constructor(private readonly stationService: StationService) {}

  /**
   * Gets all stations
   */
  async getAllStations(req: Request, res: Response): Promise<void> {
    const result = await this.stationService.getAllStations()

    if (!result.success) {
      res.status(500).json({ error: result.message })
      return
    }

    const stations = result.data.map((station) => ({
      id: station.id.value,
      fullName: station.fullName,
      popularName: station.popularName,
      shortName: station.shortName,
      transportMode: station.mode,
      location: {
        latitude: station.location.latitude,
        longitude: station.location.longitude,
      },
      country: station.country,
      region: station.region,
    }))

    const response: StationsResponse = { stations }
    res.json(response)
  }

  /**
   * Gets a station by ID
   */
  async getStationById(req: Request, res: Response): Promise<void> {
    const stationId = req.params.id

    if (!stationId) {
      res.status(400).json({ error: "Station ID is required" })
      return
    }

    const result = await this.stationService.getStationById(new StationId(stationId))

    if (!result.success) {
      res.status(500).json({ error: result.message })
      return
    }

    if (!result.data) {
      res.status(404).json({ error: "Station not found" })
      return
    }

    const station = result.data
    const response: StationResponse = {
      id: station.id.value,
      fullName: station.fullName,
      popularName: station.popularName,
      shortName: station.shortName,
      transportMode: station.mode,
      location: {
        latitude: station.location.latitude,
        longitude: station.location.longitude,
      },
      country: station.country,
      region: station.region,
    }

    res.json(response)
  }

  /**
   * Gets stations by region
   */
  async getStationsByRegion(req: Request, res: Response): Promise<void> {
    const region = req.query.region as string

    if (!region) {
      res.status(400).json({ error: "Region is required" })
      return
    }

    const result = await this.stationService.getStationsByRegion(region)

    if (!result.success) {
      res.status(500).json({ error: result.message })
      return
    }

    const stations = result.data.map((station) => ({
      id: station.id.value,
      fullName: station.fullName,
      popularName: station.popularName,
      shortName: station.shortName,
      transportMode: station.mode,
      location: {
        latitude: station.location.latitude,
        longitude: station.location.longitude,
      },
      country: station.country,
      region: station.region,
    }))

    const response: StationsResponse = { stations }
    res.json(response)
  }
}
