import { z } from "zod";
import { StationId } from "./Station";
import { Route } from "./Route";

// Query value object
export class ReachabilityQuery {
  constructor(
    public readonly origin: StationId,
    public readonly maxTransfers: number
  ) {}
}

// Result value object
export class ReachabilityResult {
  constructor(
    public readonly origin: StationId,
    public readonly maxTransfers: number,
    public readonly reachableStations: Map<string, StationId[]>,
    public readonly routes: Route[]
  ) {}

  /**
   * Get all stations reachable with exactly the specified number of transfers
   */
  getStationsWithTransfers(transfers: number): StationId[] {
    return this.reachableStations.get(transfers.toString()) || [];
  }

  /**
   * Get all stations reachable with up to the specified number of transfers
   */
  getStationsWithinTransfers(maxTransfers: number): StationId[] {
    const result: StationId[] = [];

    for (let i = 0; i <= maxTransfers; i++) {
      const stations = this.getStationsWithTransfers(i);
      result.push(...stations);
    }

    return result;
  }

  /**
   * Get total count of all reachable stations
   */
  getTotalReachableStations(): number {
    let total = 0;

    for (const stations of this.reachableStations.values()) {
      total += stations.length;
    }

    return total;
  }

  // Convert to DTO for API response
  toResponse(): ReachabilityResponse {
    const reachableByTransfers: Record<string, string[]> = {};

    this.reachableStations.forEach((stations, transferCount) => {
      reachableByTransfers[transferCount] = stations.map((s) => s.toString());
    });

    return {
      originStationId: this.origin.toString(),
      maxTransfers: this.maxTransfers,
      reachableByTransfers,
      connectedRouteIds: this.routes.map((r) => r.id.toString()),
    };
  }
}

// DTO schemas
export const ReachabilityQuerySchema = z.object({
  originStationId: z.string(),
  maxTransfers: z.number().int().min(0).max(3),
});

export type ReachabilityQueryDTO = z.infer<typeof ReachabilityQuerySchema>;

export const ReachabilityResponseSchema = z.object({
  originStationId: z.string(),
  maxTransfers: z.number().int(),
  reachableByTransfers: z.record(z.string(), z.array(z.string())),
  connectedRouteIds: z.array(z.string()),
});

export type ReachabilityResponse = z.infer<typeof ReachabilityResponseSchema>;
