import { z } from "zod";

// Placeholder for ScheduleDto - adjust based on actual data structure
export interface ScheduleDto {
  id: string;
  stationId: string;
  // Example fields, replace with actual schedule details
  arrivalTime: string | null;
  departureTime: string | null;
  platform: string | null;
}

export const ScheduleSchema = z.object({
  id: z.string(),
  stationId: z.string(),
  arrivalTime: z.string().nullable(),
  departureTime: z.string().nullable(),
  platform: z.string().nullable(),
});

export const ScheduleArraySchema = z.array(ScheduleSchema);
