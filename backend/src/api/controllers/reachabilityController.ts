import type { Request, Response } from "express"
import { ReachabilityQuery } from "../../domain/entities"
import { StationId } from "../../domain/valueObjects"
import type { ReachabilityService } from "../../services/reachabilityService"
import type { ReachabilityResponse } from "../schemas/reachabilitySchemas"

export class ReachabilityController {
  constructor(private readonly reachabilityService: ReachabilityService) {}

  /**
   * Calculates reachability from a station
   */
  async calculateReachability(req: Request, res: Response): Promise<void> {
    const stationId = req.query.stationId as string
    const maxTransfers = Number.parseInt(req.query.maxTransfers as string) || 0

    if (!stationId) {
      res.status(400).json({ error: "Station ID is required" })
      return
    }

    try {
      const query = new ReachabilityQuery(new StationId(stationId), maxTransfers)
      const result = await this.reachabilityService.calculateReachability(query)

      if (!result.success) {
        res.status(500).json({ error: result.message })
        return
      }

      const reachabilityResult = result.data
      const response: ReachabilityResponse = {
        origin: reachabilityResult.origin.value,
        usedTransfers: reachabilityResult.usedTransfers,
        reachableStations: reachabilityResult.reachableStations.map((station) => station.value),
        connectedRoutes: reachabilityResult.connectedRoutes.map((route) => route.value),
      }

      res.json(response)
    } catch (error) {
      res.status(500).json({ error: `Failed to calculate reachability: ${error}` })
    }
  }
}
