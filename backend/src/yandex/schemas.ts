import { z } from "zod";

// Station schema
export const StationSchema = z.object({
  code: z.string(),
  title: z.string(),
  popular_title: z.string().nullable(),
  short_title: z.string().nullable(),
  transport_type: z.string(),
  station_type: z.string().nullable(),
  station_type_name: z.string().nullable(),
  longitude: z.number(),
  latitude: z.number(),
  country: z.string().nullable(),
  region: z.string().nullable(),
  settlement: z.string().nullable(),
});

export type Station = z.infer<typeof StationSchema>;

// Stations list response
export const StationsListResponseSchema = z.object({
  countries: z.record(z.string(), z.any()).optional(),
  regions: z.record(z.string(), z.any()).optional(),
  settlements: z.record(z.string(), z.any()).optional(),
  stations: z.array(StationSchema),
});

export type StationsListResponse = z.infer<typeof StationsListResponseSchema>;

// Thread schema
export const ThreadSchema = z.object({
  uid: z.string(),
  title: z.string(),
  number: z.string(),
  short_title: z.string(),
  transport_type: z.string(),
  carrier: z
    .object({
      code: z.number(),
      title: z.string(),
    })
    .optional(),
  thread_method_link: z.string().optional(),
});

export type Thread = z.infer<typeof ThreadSchema>;

// Schedule item schema
export const ScheduleItemSchema = z.object({
  thread: ThreadSchema,
  days: z.string(),
  departure: z.string().nullable(),
  arrival: z.string().nullable(),
  is_fuzzy: z.boolean(),
});

export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;

// Station schedule response
export const StationScheduleResponseSchema = z.object({
  date: z.string(),
  station: StationSchema,
  schedule: z.array(ScheduleItemSchema),
  pagination: z
    .object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
    })
    .optional(),
});

export type StationScheduleResponse = z.infer<
  typeof StationScheduleResponseSchema
>;

// Thread stop schema
export const ThreadStopSchema = z.object({
  station: StationSchema,
  stop_time: z.string().nullable(),
  departure: z.string().nullable(),
  arrival: z.string().nullable(),
  terminal: z.boolean().optional(),
});

export type ThreadStop = z.infer<typeof ThreadStopSchema>;

// Thread response
export const ThreadResponseSchema = z.object({
  thread: ThreadSchema,
  stops: z.array(ThreadStopSchema),
});

export type ThreadResponse = z.infer<typeof ThreadResponseSchema>;
