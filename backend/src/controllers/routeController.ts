import { Request, Response } from "express";
import { z } from "zod";
import { RouteService } from "../services/RouteService";
import { RouteId } from "../models/Route";
import { StationId } from "../models/Station";

export class RouteController {
  constructor(private routeService: RouteService) {}

  /**
   * Get all routes
   */
  async getAllRoutes(_req: Request, res: Response): Promise<void> {
    // This method needs to be implemented in the RouteService
    // For now, we'll return a not implemented error
    res.status(501).json({ error: "Get all routes not implemented" });
  }

  /**
   * Get route by ID
   */
  async getRouteById(req: Request, res: Response): Promise<void> {
    const routeIdSchema = z.object({
      id: z.string().min(1),
    });

    try {
      const { id } = routeIdSchema.parse(req.params);
      const result = await this.routeService.getRouteById(new RouteId(id));

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(404).json({ error: result.error });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid route ID" });
    }
  }

  /**
   * Get routes by station ID
   */
  async getRoutesByStation(req: Request, res: Response): Promise<void> {
    const stationIdSchema = z.object({
      stationId: z.string().min(1),
    });

    try {
      const { stationId } = stationIdSchema.parse(req.params);
      const result = await this.routeService.getRoutesByStation(
        new StationId(stationId)
      );

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(404).json({ error: result.error });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid station ID" });
    }
  }
}
