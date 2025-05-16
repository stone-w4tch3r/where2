import { Request, Response } from "express";
import { z } from "zod";
import { TransferCalculator } from "../services/TransferCalculator";
import { StationId } from "../models/Station";

export class ReachabilityController {
  constructor(private transferCalculator: TransferCalculator) {}

  /**
   * Get reachable stations from a given station with max transfers
   */
  async getReachableStations(req: Request, res: Response): Promise<void> {
    const reachabilitySchema = z.object({
      stationId: z.string().min(1),
      maxTransfers: z.number().int().min(0).max(3).default(1),
    });

    try {
      const { stationId, maxTransfers } = reachabilitySchema.parse(req.query);

      const stationIdObj = new StationId(stationId);

      const result = await this.transferCalculator.calculateReachableStations(
        stationIdObj,
        maxTransfers
      );

      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(404).json({ error: result.error });
      }
    } catch (error) {
      res
        .status(400)
        .json({ error: "Invalid parameters for reachability calculation" });
    }
  }
}
