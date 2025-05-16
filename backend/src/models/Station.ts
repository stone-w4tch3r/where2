import { z } from "zod";

// Value objects
export class StationId {
  constructor(public readonly value: string) {}

  static fromYandexCode(code: string): StationId {
    return new StationId(code);
  }

  toString(): string {
    return this.value;
  }
}

export enum TransportMode {
  Train = "train",
  Bus = "bus",
  Tram = "tram",
  Metro = "metro",
}

export class Coordinates {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {}

  static fromLatLng(lat: number, lng: number): Coordinates {
    return new Coordinates(lat, lng);
  }
}

// Domain entity
export class Station {
  constructor(
    public readonly id: StationId,
    public readonly fullName: string,
    public readonly popularName: string | null,
    public readonly shortName: string | null,
    public readonly mode: TransportMode,
    public readonly location: Coordinates,
    public readonly country: string | null,
    public readonly region: string | null
  ) {}

  static fromYandexStation(yandexStation: any): Station {
    return new Station(
      StationId.fromYandexCode(yandexStation.code),
      yandexStation.title,
      yandexStation.popular_title,
      yandexStation.short_title,
      yandexStation.transport_type as TransportMode,
      Coordinates.fromLatLng(yandexStation.latitude, yandexStation.longitude),
      yandexStation.country,
      yandexStation.region
    );
  }
}

// DTO schemas
export const StationResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  popularName: z.string().nullable(),
  shortName: z.string().nullable(),
  mode: z.nativeEnum(TransportMode),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  country: z.string().nullable(),
  region: z.string().nullable(),
});

export type StationResponse = z.infer<typeof StationResponseSchema>;

export const StationListResponseSchema = z.array(StationResponseSchema);
export type StationListResponse = z.infer<typeof StationListResponseSchema>;
