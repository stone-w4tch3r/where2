// TypeScript representations of the Prisma models for use as return types in ORM services

import { TransportMode } from "../shared/transport-mode.dto";

export type Station = {
  id: string;
  fullName: string;
  transportMode: TransportMode;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  region: string | null;
};

export type Route = {
  id: string;
  shortTitle: string;
  fullTitle: string;
  transportMode: TransportMode;
  routeInfoUrl: string | null;
};

// New type for Route with mandatory stops
export type RouteWithStops = Route & {
  stops: RouteStopWithStation[];
};

export type RouteStop = {
  id: number;
  routeId: string;
  stationId: string;
  stopPosition: number;
};

// New type combining RouteStop and Station
export type RouteStopWithStation = RouteStop & {
  station: Station;
};
