import { z } from "zod";

export const stationSchema = z.object({
  code: z.string().describe("Station code in Yandex Schedule system"),
  title: z.string().describe("Station name"),
  popular_title: z.string().nullable().describe("Common name of the station"),
  short_title: z.string().nullable().describe("Short name of the station"),
  transport_type: z
    .enum(["plane", "train", "suburban", "bus", "water", "helicopter"])
    .describe("Type of transport"),
  station_type: z
    .enum([
      "station",
      "platform",
      "stop",
      "checkpoint",
      "post",
      "crossing",
      "overtaking_point",
      "train_station",
      "airport",
      "bus_station",
      "bus_stop",
      "unknown",
      "port",
      "port_point",
      "wharf",
      "river_port",
      "marine_station",
    ])
    .describe("Type of station"),
  station_type_name: z
    .string()
    .describe("Station type name in human readable format"),
  type: z.enum(["station", "settlement"]).describe("Type of point"),
});

export const carrierCodesSchema = z.object({
  icao: z.string().nullable().describe("ICAO carrier code"),
  sirena: z.string().nullable().describe("Sirena carrier code"),
  iata: z.string().nullable().describe("IATA carrier code"),
});

export const carrierSchema = z.object({
  code: z.number().describe("Carrier code in Yandex Schedule system"),
  contacts: z.string().optional().describe("Contact information"),
  url: z.string().optional().describe("Carrier website"),
  logo_svg: z.string().nullable().optional().describe("SVG logo URL"),
  title: z.string().describe("Carrier name"),
  phone: z.string().optional().describe("Contact phone number"),
  codes: carrierCodesSchema,
  address: z.string().optional().describe("Legal address"),
  logo: z.string().optional().describe("Raster logo URL"),
  email: z
    .string()
    .email()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional()
    .describe("Email address"),
  thread_method_link: z
    .string()
    .optional()
    .describe("URL for thread info request"),
});

export const transportSubtypeSchema = z.object({
  color: z
    .string()
    .nullable()
    .describe("Main color of transport in hex format"),
  code: z.string().nullable().describe("Transport subtype code"),
  title: z.string().nullable().describe("Transport subtype description"),
});

export const threadSchema = z.object({
  uid: z.string().max(100).describe("Thread identifier in Yandex Schedule"),
  title: z.string().describe("Thread name (full station names)"),
  number: z.string().describe("Route number"),
  short_title: z.string().describe("Thread name (short station names)"),
  thread_method_link: z
    .string()
    .optional()
    .describe("URL for thread info request"),
  carrier: carrierSchema,
  transport_type: z.enum([
    "plane",
    "train",
    "suburban",
    "bus",
    "water",
    "helicopter",
  ]),
  vehicle: z.string().nullable().describe("Vehicle name"),
  transport_subtype: transportSubtypeSchema.nullable(),
  express_type: z
    .enum(["express", "aeroexpress"])
    .nullable()
    .describe("Express train type"),
});

export const priceSchema = z.object({
  cents: z.number().describe("Minor currency units"),
  whole: z.number().describe("Major currency units"),
});

export const placeSchema = z.object({
  currency: z.string().describe("Currency code"),
  price: priceSchema,
  name: z.string().describe("Ticket type name"),
});

export const ticketsInfoSchema = z
  .object({
    et_marker: z.boolean().describe("Electronic ticket availability"),
    places: z
      .array(
        placeSchema.extend({
          name: z.string().nullable().describe("Ticket type name"),
        })
      )
      .describe("Available ticket types and prices"),
  })
  .nullable()
  .describe("Tickets information");

export const segmentSchema = z.object({
  arrival: z.string().describe("Arrival time in ISO 8601"),
  from: stationSchema,
  thread: threadSchema,
  departure_platform: z.string().describe("Departure platform number"),
  departure: z.string().describe("Departure time in ISO 8601"),
  stops: z.string().max(1000).describe("Stops description"),
  departure_terminal: z.string().nullable().describe("Departure terminal name"),
  to: stationSchema,
  has_transfers: z.boolean().describe("Has transfers flag"),
  tickets_info: ticketsInfoSchema,
  duration: z.number().describe("Trip duration in seconds"),
  arrival_terminal: z.string().nullable().describe("Arrival terminal name"),
  start_date: z.string().describe("Departure date"),
  arrival_platform: z.string().describe("Arrival platform number"),
});

export const paginationSchema = z.object({
  total: z.number().describe("Total number of matching routes"),
  limit: z.number().describe("Results per page limit"),
  offset: z.number().describe("Results offset"),
});

export const searchInfoSchema = z.object({
  date: z.string().describe("Search date in YYYY-MM-DD format"),
  to: z.object({
    code: z.string(),
    type: z.enum(["station", "settlement"]),
    popular_title: z.string().nullable(),
    short_title: z.string(),
    title: z.string(),
  }),
  from: z.object({
    code: z.string(),
    type: z.enum(["station", "settlement"]),
    popular_title: z.string().nullable(),
    short_title: z.string(),
    title: z.string(),
  }),
});

export const directionSchema = z.object({
  code: z
    .string()
    .describe('Direction code (e.g. "arrival", "all", "на Москву")'),
  title: z.string().describe("Direction name in human readable format"),
});

export const intervalSchema = z.object({
  density: z
    .string()
    .describe(
      'Interval description (e.g. "маршрутное такси раз в 15-30 минут")'
    ),
  begin_time: z.string().describe("Service begin time in ISO 8601"),
  end_time: z.string().describe("Service end time in ISO 8601"),
});

// Extending thread schema to include interval info
export const threadSchemaWithInterval = threadSchema.extend({
  interval: intervalSchema
    .optional()
    .describe("Schedule interval information for regular services"),
});

// Response schema for a stop in thread
export const threadStopSchema = z.object({
  arrival: z.string().nullable().describe("Arrival time in ISO 8601 format"),
  departure: z
    .string()
    .nullable()
    .describe("Departure time in ISO 8601 format"),
  terminal: z.string().nullable().describe("Airport terminal"),
  platform: z.string().describe("Platform or track number"),
  station: stationSchema.describe("Stop station information"),
  stop_time: z.number().nullable().describe("Stop duration in seconds"),
  duration: z.number().describe("Travel time from previous stop in seconds"),
});

// Station codes schema
export const stationCodesSchema = z.object({
  yandex_code: z.string().describe("Station code in Yandex Schedule system"),
  esr_code: z.string().optional().describe("Station code in ESR system"),
});

// Station schema
export const stationListItemSchema = z
  .object({
    title: z.string().describe("Station name"),
    direction: z
      .string()
      .describe("Train direction (empty for non-railway stations)"),
    codes: stationCodesSchema,
    station_type: z
      .enum([
        "station",
        "platform",
        "stop",
        "checkpoint",
        "post",
        "crossing",
        "overtaking_point",
        "train_station",
        "airport",
        "bus_station",
        "bus_stop",
        "unknown",
        "port",
        "port_point",
        "wharf",
        "river_port",
        "marine_station",
        "",
      ])
      .describe("Type of station"),
    transport_type: z
      .enum(["plane", "train", "suburban", "bus", "water", "helicopter", "sea"])
      .describe("Type of transport"),
    longitude: z
      .union([z.number(), z.literal("")])
      .describe("Station longitude"),
    latitude: z
      .union([z.number(), z.literal("")])
      .transform((val) => (val === "" ? "" : val.toString()))
      .describe("Station latitude"),
  })
  .describe(
    'If a station has latitude or longitude equal to "", it is invalid'
  );

// Settlement schema
export const settlementSchema = z.object({
  title: z.string().describe("Settlement name"),
  codes: z.object({
    yandex_code: z
      .string()
      .optional()
      .describe("Settlement code in Yandex Schedule system"),
  }),
  stations: z
    .array(stationListItemSchema)
    .transform((arr) =>
      arr.filter((s) => s.latitude !== "" && s.longitude !== "")
    )
    .describe("List of stations in settlement"),
});

// Region schema
export const regionSchema = z.object({
  title: z.string().describe("Region name"),
  codes: z.object({
    yandex_code: z
      .string()
      .optional()
      .describe("Region code in Yandex Schedule system"),
  }),
  settlements: z
    .array(settlementSchema)
    .describe("List of settlements in region"),
});

// Country schema
export const countrySchema = z
  .object({
    title: z.string().describe("Country name"),
    codes: z.object({
      yandex_code: z
        .string()
        .optional()
        .describe("Country code in Yandex Schedule system"),
    }),
    regions: z.array(regionSchema).describe("List of regions in country"),
  })
  .describe("If a country has no codes.yandex_code, it is not valid");

export type StationContract = z.infer<typeof stationSchema>;
export type CarrierCodesContract = z.infer<typeof carrierCodesSchema>;
export type CarrierContract = z.infer<typeof carrierSchema>;
export type TransportSubtypeContract = z.infer<typeof transportSubtypeSchema>;
export type ThreadContract = z.infer<typeof threadSchema>;
export type PriceContract = z.infer<typeof priceSchema>;
export type PlaceContract = z.infer<typeof placeSchema>;
export type TicketsInfoContract = z.infer<typeof ticketsInfoSchema>;
export type SegmentContract = z.infer<typeof segmentSchema>;
export type PaginationContract = z.infer<typeof paginationSchema>;
export type SearchInfoContract = z.infer<typeof searchInfoSchema>;
export type DirectionContract = z.infer<typeof directionSchema>;
export type IntervalContract = z.infer<typeof intervalSchema>;
export type ThreadWithIntervalContract = z.infer<
  typeof threadSchemaWithInterval
>;
export type ThreadStopContract = z.infer<typeof threadStopSchema>;
export type StationCodesContract = z.infer<typeof stationCodesSchema>;
export type StationListItemContract = z.infer<typeof stationListItemSchema>;
export type SettlementContract = z.infer<typeof settlementSchema>;
export type RegionContract = z.infer<typeof regionSchema>;
export type CountryContract = z.infer<typeof countrySchema>;
