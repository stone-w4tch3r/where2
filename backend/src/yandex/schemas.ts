/**
 * This file contains type definitions adapted from the Yandex API response schemas
 * It provides compatibility for code that was using the old client implementation
 */

// Schedule item type from station schedule response
export type ScheduleItem = {
  thread: {
    uid: string;
    title: string;
    number: string;
    short_title: string;
    carrier: {
      code: number;
      title: string;
    };
    transport_type: string;
    vehicle: string | null;
  };
  stops: string;
  departure: string;
  arrival: string | null;
  is_fuzzy: boolean;
  days: string;
  terminal: string | null;
  platform: string;
};

// Station type from stations list response
export type YandexStation = {
  title: string;
  code: string;
  station_type: string;
  transport_type: string;
  latitude: number;
  longitude: number;
};
