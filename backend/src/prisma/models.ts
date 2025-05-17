// TypeScript representations of the Prisma models for use as return types in ORM services

export type Station = {
  id: string;
  fullName: string;
  popularName: string | null;
  shortName: string | null;
  transportMode: string;
  latitude: number;
  longitude: number;
  country: string | null;
  region: string | null;
};

export type Route = {
  id: string;
  shortTitle: string;
  fullTitle: string;
  transportMode: string;
  routeInfoUrl: string | null;
};

export type RouteStop = {
  id: number;
  routeId: string;
  stationId: string;
  stopPosition: number;
};
