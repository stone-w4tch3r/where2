base-schemas.ts:

```ts
import { z } from "zod";

const stationSchema = z.object({
  code: z.string().describe("Station code in Yandex Schedule system"),
  title: z.string().describe("Station name"),
  popular_title: z.string().describe("Common name of the station"),
  short_title: z.string().describe("Short name of the station"),
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

const carrierCodesSchema = z.object({
  icao: z.string().nullable().describe("ICAO carrier code"),
  sirena: z.string().nullable().describe("Sirena carrier code"),
  iata: z.string().nullable().describe("IATA carrier code"),
});

const carrierSchema = z.object({
  code: z.number().describe("Carrier code in Yandex Schedule system"),
  contacts: z.string().describe("Contact information"),
  url: z.string().url().describe("Carrier website"),
  logo_svg: z.string().nullable().describe("SVG logo URL"),
  title: z.string().describe("Carrier name"),
  phone: z.string().describe("Contact phone number"),
  codes: carrierCodesSchema,
  address: z.string().describe("Legal address"),
  logo: z.string().describe("Raster logo URL"),
  email: z.string().email().describe("Email address"),
});

const transportSubtypeSchema = z.object({
  color: z.string().describe("Main color of transport in hex format"),
  code: z.string().describe("Transport subtype code"),
  title: z.string().describe("Transport subtype description"),
});

const threadSchema = z.object({
  uid: z.string().max(100).describe("Thread identifier in Yandex Schedule"),
  title: z.string().describe("Thread name (full station names)"),
  number: z.string().describe("Route number"),
  short_title: z.string().describe("Thread name (short station names)"),
  thread_method_link: z.string().url().describe("URL for thread info request"),
  carrier: carrierSchema,
  transport_type: z.enum([
    "plane",
    "train",
    "suburban",
    "bus",
    "water",
    "helicopter",
  ]),
  vehicle: z.string().describe("Vehicle name"),
  transport_subtype: transportSubtypeSchema,
  express_type: z
    .enum(["express", "aeroexpress"])
    .nullable()
    .describe("Express train type"),
});

const priceSchema = z.object({
  cents: z.number().describe("Minor currency units"),
  whole: z.number().describe("Major currency units"),
});

const placeSchema = z.object({
  currency: z.string().describe("Currency code"),
  price: priceSchema,
  name: z.string().describe("Ticket type name"),
});

const ticketsInfoSchema = z.object({
  et_marker: z.boolean().describe("Electronic ticket availability"),
  places: z.array(placeSchema).describe("Available ticket types and prices"),
});

const segmentSchema = z.object({
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

const paginationSchema = z.object({
  total: z.number().describe("Total number of matching routes"),
  limit: z.number().describe("Results per page limit"),
  offset: z.number().describe("Results offset"),
});

const searchInfoSchema = z.object({
  date: z.string().describe("Search date in YYYY-MM-DD format"),
  to: z.object({
    code: z.string(),
    type: z.enum(["station", "settlement"]),
    popular_title: z.string(),
    short_title: z.string(),
    title: z.string(),
  }),
  from: z.object({
    code: z.string(),
    type: z.enum(["station", "settlement"]),
    popular_title: z.string(),
    short_title: z.string(),
    title: z.string(),
  }),
});

const directionSchema = z.object({
  code: z
    .string()
    .describe('Direction code (e.g. "arrival", "all", "на Москву")'),
  title: z.string().describe("Direction name in human readable format"),
});

const intervalSchema = z.object({
  density: z
    .string()
    .describe(
      'Interval description (e.g. "маршрутное такси раз в 15-30 минут")'
    ),
  begin_time: z.string().describe("Service begin time in ISO 8601"),
  end_time: z.string().describe("Service end time in ISO 8601"),
});

// Extending thread schema to include interval info
const threadSchemaWithInterval = threadSchema.extend({
  interval: intervalSchema
    .optional()
    .describe("Schedule interval information for regular services"),
});

// Response schema for a stop in thread
const threadStopSchema = z.object({
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
```

stations-endpoint.ts:

````ts
// Request parameters type
interface StationScheduleParams {
  /** Station code */
  station: string;
  /** Response language (e.g. "ru_RU") */
  lang?: string;
  /** Response format (json/xml) */
  format?: "json" | "xml";
  /** Date in YYYY-MM-DD format */
  date?: string;
  /** Transport type filter */
  transport_types?:
    | "plane"
    | "train"
    | "suburban"
    | "bus"
    | "water"
    | "helicopter";
  /** Event filter */
  event?: "departure" | "arrival";
  /** Station code system */
  system?: "yandex" | "iata" | "sirena" | "express" | "esr";
  /** Response code systems */
  show_systems?: "yandex" | "esr" | "all";
  /** Direction filter (for suburban only) */
  direction?: string;
  /** Response timezone */
  result_timezone?: string;
}

// Response schema
const stationScheduleResponseSchema = z.object({
  date: z
    .string()
    .nullable()
    .describe("Schedule date in YYYY-MM-DD format, null if not specified"),
  pagination: paginationSchema,
  station: stationSchema,
  schedule: z
    .array(
      z.object({
        except_days: z
          .string()
          .nullable()
          .describe("Days when service does not run"),
        arrival: z.string().describe("Arrival time in ISO 8601"),
        thread: threadSchemaWithInterval,
        is_fuzzy: z.boolean().describe("Whether times are approximate"),
        days: z.string().describe("Service days description"),
        stops: z.string().max(1000).describe("Stops description"),
        departure: z.string().describe("Departure time in ISO 8601"),
        terminal: z.string().nullable().describe("Airport terminal"),
        platform: z.string().describe("Platform or track number"),
      })
    )
    .describe("List of scheduled services"),
  interval_schedule: z
    .array(
      z.object({
        except_days: z.string().nullable(),
        thread: threadSchemaWithInterval,
        is_fuzzy: z.boolean(),
        days: z.string(),
        stops: z.string().max(1000),
        terminal: z.string().nullable(),
        platform: z.string(),
      })
    )
    .describe("List of interval-based services"),
  schedule_direction: directionSchema
    .optional()
    .describe("Requested direction info, if specified"),
  directions: z
    .array(directionSchema)
    .optional()
    .describe("Available directions for suburban trains"),
});

const fetchStationSchedule = async (
  apiKey: string,
  params: StationScheduleParams
) => {
  const response = await axios.get(
    "https://api.rasp.yandex.net/v3.0/schedule/",
    {
      params: {
        apikey: apiKey,
        ...params,
      },
    }
  );
  return stationScheduleResponseSchema.parse(response.data);
};

/**
 * React Query hook for fetching station schedule
 * @param apiKey - Yandex Schedule API key
 * @param params - Schedule search parameters
 * @example
 * ```
 * const { data, isLoading, error } = useStationSchedule('your-api-key', {
 *   station: 's9600213', // Sheremetyevo
 *   date: '2024-01-20',
 *   transport_types: 'plane',
 *   event: 'departure'
 * })
 * ```
 */
export const useStationSchedule = (
  apiKey: string,
  params: StationScheduleParams
) => {
  return useQuery({
    queryKey: ["stationSchedule", params],
    queryFn: () => fetchStationSchedule(apiKey, params),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
};
````

````ts
// Request parameters
interface BetweenStationsScheduleParams {
  /** From station code */
  from: string;
  /** To station code */
  to: string;
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Results offset */
  offset?: number;
  /** Results per page */
  limit?: number;
  /** Show interval routes */
  show_intervals?: boolean;
}

// Response schema
const betweenStationsScheduleResponseSchema = z.object({
  pagination: paginationSchema,
  segments: z.array(segmentSchema).describe("List of found routes"),
  interval_segments: z
    .array(segmentSchema)
    .describe("List of interval routes without fixed schedule"),
  search: searchInfoSchema,
});

const fetchSchedule = async (
  apiKey: string,
  params: BetweenStationsScheduleParams
) => {
  const response = await axios.get("https://api.rasp.yandex.net/v3.0/search/", {
    params: {
      apikey: apiKey,
      ...params,
    },
  });
  return betweenStationsScheduleResponseSchema.parse(response.data);
};

/**
 * React Query hook for fetching schedule between stations
 * @example
 * ```
 * const { data, isLoading, error } = useSchedule('your-api-key', {
 *   from: 's9600396', // Simferopol
 *   to: 's9600213',   // Sheremetyevo
 *   date: '2024-01-20'
 * })
 * ```
 */
export const useSchedule = (
  apiKey: string,
  params: BetweenStationsScheduleParams
) => {
  return useQuery({
    queryKey: ["schedule", params],
    queryFn: () => fetchSchedule(apiKey, params),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
};
````

````ts
// thread-stations-endpoint.ts

import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { stationSchema, threadSchema, intervalSchema } from "./base-schemas";

// Request parameters schema
const threadStationsParamsSchema = z.object({
  uid: z
    .string()
    .max(100)
    .describe("Thread identifier in Yandex Schedule system"),
  from: z
    .string()
    .optional()
    .describe("Departure station code in specified coding system"),
  to: z
    .string()
    .optional()
    .describe("Arrival station code in specified coding system"),
  format: z
    .enum(["json", "xml"])
    .optional()
    .default("json")
    .describe("Response format (json/xml)"),
  lang: z
    .enum(["ru_RU", "uk_UA"])
    .optional()
    .default("ru_RU")
    .describe("Response language code"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Thread date in YYYY-MM-DD format"),
  show_systems: z
    .enum(["yandex", "esr", "all"])
    .optional()
    .describe("Station coding systems to include in response"),
});

// Thread stations response schema
const threadStationsResponseSchema = z.object({
  except_days: z.string().describe("Days when thread does not run"),
  arrival_date: z.string().nullable().describe("Arrival date at destination"),
  from: z.string().nullable().describe("Departure point code"),
  uid: z.string().max(100).describe("Thread identifier"),
  title: z.string().describe("Thread name with full station names"),
  interval: intervalSchema
    .optional()
    .describe("Schedule interval for regular services"),
  departure_date: z.string().nullable().describe("Departure date from origin"),
  start_time: z.string().describe("Departure time from first station"),
  number: z.string().describe("Route number"),
  short_title: z.string().describe("Thread name with short station names"),
  days: z.string().describe("Service days description"),
  to: z.string().nullable().describe("Arrival point code"),
  carrier: threadSchema.shape.carrier,
  transport_type: threadSchema.shape.transport_type,
  stops: z.array(threadStopSchema).describe("List of stops in thread"),
  vehicle: z.string().nullable().describe("Vehicle name"),
  start_date: z.string().describe("First service date"),
  transport_subtype: threadSchema.shape.transport_subtype,
  express_type: threadSchema.shape.express_type,
});

type ThreadStationsParams = z.infer<typeof threadStationsParamsSchema>;

/**
 * Fetches list of stations for a specific thread
 * @param params - Thread stations request parameters
 * @returns Thread stations response data
 */
const fetchThreadStations = async (params: ThreadStationsParams) => {
  const response = await axios.get("https://api.rasp.yandex.net/v3.0/thread/", {
    params,
  });
  return threadStationsResponseSchema.parse(response.data);
};

/**
 * React Query hook for fetching thread stations
 * @param params - Thread stations request parameters
 * @param options - React Query options
 * @example
 * ```
 * const { data, isLoading, error } = useThreadStations({
 *   uid: '038AA_tis',
 *   date: '2024-01-20',
 *   show_systems: 'all'
 * }, 'your-api-key')
 * ```
 */
export const useThreadStations = (
  params: ThreadStationsParams,
  apiKey: string
) => {
  return useQuery({
    queryKey: ["threadStations", params],
    queryFn: () => fetchThreadStations({ ...params, apikey: apiKey }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
````

````ts
// stations-list-schemas.ts
import { z } from "zod";

// Station codes schema
const stationCodesSchema = z.object({
  yandex_code: z.string().describe("Station code in Yandex Schedule system"),
  esr_code: z.string().optional().describe("Station code in ESR system"),
});

// Station schema
const stationListItemSchema = z.object({
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
    ])
    .describe("Type of station"),
  transport_type: z
    .enum(["plane", "train", "suburban", "bus", "water", "helicopter"])
    .describe("Type of transport"),
  longitude: z.number().describe("Station longitude"),
  latitude: z.number().describe("Station latitude"),
});

// Settlement schema
const settlementSchema = z.object({
  title: z.string().describe("Settlement name"),
  codes: z.object({
    yandex_code: z
      .string()
      .optional()
      .describe("Settlement code in Yandex Schedule system"),
  }),
  stations: z
    .array(stationListItemSchema)
    .describe("List of stations in settlement"),
});

// Region schema
const regionSchema = z.object({
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
const countrySchema = z.object({
  title: z.string().describe("Country name"),
  codes: z.object({
    yandex_code: z.string().describe("Country code in Yandex Schedule system"),
  }),
  regions: z.array(regionSchema).describe("List of regions in country"),
});

// Full response schema
export const stationsListResponseSchema = z.object({
  countries: z.array(countrySchema).describe("List of countries with stations"),
});

// stations-list-api.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { stationsListResponseSchema } from "./stations-list-schemas";

// Request parameters interface
interface StationsListParams {
  /** Response language (e.g. "ru_RU", "uk_UA") */
  lang?: string;
  /** Response format (json/xml) */
  format?: "json" | "xml";
}

const fetchStationsList = async (
  apiKey: string,
  params?: StationsListParams
) => {
  const response = await axios.get(
    "https://api.rasp.yandex.net/v3.0/stations_list/",
    {
      params: {
        apikey: apiKey,
        ...params,
      },
    }
  );
  return stationsListResponseSchema.parse(response.data);
};

/**
 * React Query hook for fetching complete stations list
 * Note: Response is about 40MB in size, use with caution
 * @example
 * ```
 * const { data, isLoading, error } = useStationsList('your-api-key', {
 *   lang: 'ru_RU',
 *   format: 'json'
 * })
 * ```
 */
export const useStationsList = (
  apiKey: string,
  params?: StationsListParams
) => {
  return useQuery({
    queryKey: ["stationsList", params],
    queryFn: () => fetchStationsList(apiKey, params),
    staleTime: 24 * 60 * 60 * 1000, // Consider data stale after 24 hours
    cacheTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
};
````
