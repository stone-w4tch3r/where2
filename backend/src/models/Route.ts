import { z } from "zod";
import { StationId, TransportMode } from "./Station";

// Value object
export class RouteId {
  constructor(private readonly value: string) {}

  toString(): string {
    return this.value;
  }

  equals(other: RouteId): boolean {
    return this.value === other.value;
  }

  static fromYandexThreadUid(uid: string): RouteId {
    return new RouteId(`yandex:${uid}`);
  }
}

// Domain entity
export class Route {
  constructor(
    public readonly id: RouteId,
    public readonly number: string,
    public readonly title: string,
    public readonly transportType: TransportMode,
    public readonly stops: StationId[]
  ) {}

  static fromYandexThread(thread: any, stops: StationId[]): Route {
    return new Route(
      RouteId.fromYandexThreadUid(thread.uid),
      thread.number,
      thread.title,
      thread.transport_type as TransportMode,
      stops
    );
  }

  // Convert to DTO for API response
  toDTO() {
    return {
      id: this.id.toString(),
      number: this.number,
      title: this.title,
      transportType: this.transportType,
      stops: this.stops.map((s) => s.toString()),
    };
  }
}

// DTO schemas
export const RouteResponseSchema = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
  transportType: z.nativeEnum(TransportMode),
  stops: z.array(z.string()),
});

export type RouteResponse = z.infer<typeof RouteResponseSchema>;

export const RouteListResponseSchema = z.array(RouteResponseSchema);
export type RouteListResponse = z.infer<typeof RouteListResponseSchema>;
