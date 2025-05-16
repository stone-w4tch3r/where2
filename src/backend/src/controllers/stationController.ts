import { Request, Response } from "express";
import { z } from "zod";
import { StationService } from "../services/StationService";
import { StationId } from "../models/Station";

export class StationController {
  constructor(private stationService: StationService) {}

  /**
   * Get all stations
   */
  async getAllStations(_req: Request, res: Response): Promise<void> {
    const result = await this.stationService.getStations({});

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  }

  /**
   * Get station by ID
   */
  async getStationById(req: Request, res: Response): Promise<void> {
    const stationIdSchema = z.object({
      id: z.string().min(1),
    });

    try {
      const { id } = stationIdSchema.parse(req.params);
      const result = await this.stationService.getStationById(
        new StationId(id)
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

  /**
   * Get stations by location
   */
  async getStationsByLocation(req: Request, res: Response): Promise<void> {
    const locationSchema = z.object({
      latitude: z.number(),
      longitude: z.number(),
      radius: z.number().optional().default(5),
    });

    try {
      locationSchema.parse(req.query);
      // This method needs to be implemented in the StationService
      // For now, we'll return a not implemented error
      res
        .status(501)
        .json({ error: "Station location search not implemented" });
    } catch (error) {
      res.status(400).json({ error: "Invalid location parameters" });
    }
  }
}
