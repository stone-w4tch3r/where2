import type { Coordinates, RouteId, StationId, TransportMode } from "./valueObjects"

export class Station {
  constructor(
    private readonly _id: StationId,
    private readonly _fullName: string,
    private readonly _popularName: string | null,
    private readonly _shortName: string | null,
    private readonly _mode: TransportMode,
    private readonly _location: Coordinates,
    private readonly _country: string,
    private readonly _region: string,
  ) {}

  get id(): StationId {
    return this._id
  }

  get fullName(): string {
    return this._fullName
  }

  get popularName(): string | null {
    return this._popularName
  }

  get shortName(): string | null {
    return this._shortName
  }

  get mode(): TransportMode {
    return this._mode
  }

  get location(): Coordinates {
    return this._location
  }

  get country(): string {
    return this._country
  }

  get region(): string {
    return this._region
  }
}

export class Route {
  constructor(
    private readonly _id: RouteId,
    private readonly _shortTitle: string,
    private readonly _fullTitle: string,
    private readonly _mode: TransportMode,
    private readonly _routeInfoUrl: string,
    private readonly _stops: StationId[],
  ) {}

  get id(): RouteId {
    return this._id
  }

  get shortTitle(): string {
    return this._shortTitle
  }

  get fullTitle(): string {
    return this._fullTitle
  }

  get mode(): TransportMode {
    return this._mode
  }

  get routeInfoUrl(): string {
    return this._routeInfoUrl
  }

  get stops(): StationId[] {
    return [...this._stops]
  }

  hasStop(stationId: StationId): boolean {
    return this._stops.some((stop) => stop.equals(stationId))
  }
}

export class ReachabilityQuery {
  constructor(
    private readonly _origin: StationId,
    private readonly _maxTransfers: number,
  ) {
    if (_maxTransfers < 0) {
      throw new Error("maxTransfers must be non-negative")
    }
  }

  get origin(): StationId {
    return this._origin
  }

  get maxTransfers(): number {
    return this._maxTransfers
  }
}

export class ReachabilityResult {
  constructor(
    private readonly _origin: StationId,
    private readonly _usedTransfers: number,
    private readonly _reachableStations: StationId[],
    private readonly _connectedRoutes: RouteId[],
  ) {}

  get origin(): StationId {
    return this._origin
  }

  get usedTransfers(): number {
    return this._usedTransfers
  }

  get reachableStations(): StationId[] {
    return [...this._reachableStations]
  }

  get connectedRoutes(): RouteId[] {
    return [...this._connectedRoutes]
  }
}
