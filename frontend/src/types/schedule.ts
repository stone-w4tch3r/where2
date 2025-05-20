import { z } from "zod";

export const ScheduleSchema = z.object({
  id: z.string(),
  stationId: z.string(),
  arrivalTime: z.string().nullable(),
  departureTime: z.string().nullable(),
  platform: z.string().nullable(),
});

export const ScheduleArraySchema = z.array(ScheduleSchema);

export type ScheduleDto = z.infer<typeof ScheduleSchema>;
export type ScheduleArrayDto = z.infer<typeof ScheduleArraySchema>;
