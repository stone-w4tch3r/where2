import type { Request, Response } from "express"
import type { RouteService } from "../../services/routeService"
import { RouteId, StationId } from "../../domain/valueObjects"
import type { RouteResponse, RoutesResponse } from "../schemas/routeSchemas"

export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  /**
   * Gets all routes
   */
  async getAllRoutes(req: Request, res: Response): Promise<void> {
    const result = await this.routeService.getAllRoutes()

    if (!result.success) {
      res.status(500).json({ error: result.message })
      return
    }

    const routes = result.data.map((route) => ({
      id: route.id.value,
      shortTitle: route.shortTitle,
      fullTitle: route.fullTitle,
      transportMode: route.mode,
      routeInfoUrl: route.routeInfoUrl,
      stops: route.stops.map((stop) => stop.value),
    }))

    const response: RoutesResponse = { routes }
    res.json(response)
  }

  /**
   * Gets a route by ID
   */
  async getRouteById(req: Request, res: Response): Promise<void> {
    const routeId = req.params.id

    if (!routeId) {
      res.status(400).json({ error: "Route ID is required" })
      return
    }

    const result = await this.routeService.getRouteById(new RouteId(routeId))

    if (!result.success) {
      res.status(500).json({ error: result.message })
      return
    }

    if (!result.data) {
      res.status(404).json({ error: "Route not found" })
      return
    }

    const route = result.data
    const response: RouteResponse = {
      id: route.id.value,
      shortTitle: route.shortTitle,
      fullTitle: route.fullTitle,
      transportMode: route.mode,
      routeInfoUrl: route.routeInfoUrl,
      stops: route.stops.map((stop) => stop.value),
    }

    res.json(response)
  }

  /**
   * Gets routes by station ID
   */
  async getRoutesByStationId(req: Request, res: Response): Promise<void> {
    const stationId = req.query.stationId as string

    if (!stationId) {
      res.status(400).json({ error: "Station ID is required" })
      return
    }

    const result = await this.routeService.getRoutesByStationId(new StationId(stationId))

    if (!result.success) {
      res.status(500).json({ error: result.message })
      return
    }

    const routes = result.data.map((route) => ({
      id: route.id.value,
      shortTitle: route.shortTitle,
      fullTitle: route.fullTitle,
      transportMode: route.mode,
      routeInfoUrl: route.routeInfoUrl,
      stops: route.stops.map((stop) => stop.value),
    }))

    const response: RoutesResponse = { routes }
    res.json(response)
  }
}
