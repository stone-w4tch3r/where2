// TypeScript representations of the Prisma models for use as return types in ORM services

import { TransportMode } from "../shared/dto/transport-mode.dto";

export type Station = {
  id: string;
  fullName: string;
  popularName: string | null;
  shortName: string | null;
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

export type RouteStop = {
  id: number;
  routeId: string;
  stationId: string;
  stopPosition: number;
};
