/**
 * Value objects for the domain model
 * Following the principle of avoiding primitive obsession
 */

export class StationId {
  private readonly _value: string

  constructor(value: string) {
    if (!value || value.trim() === "") {
      throw new Error("StationId cannot be empty")
    }
    this._value = value
  }

  get value(): string {
    return this._value
  }

  equals(other: StationId): boolean {
    return this._value === other.value
  }

  toString(): string {
    return this._value
  }
}

export class RouteId {
  private readonly _value: string

  constructor(value: string) {
    if (!value || value.trim() === "") {
      throw new Error("RouteId cannot be empty")
    }
    this._value = value
  }

  get value(): string {
    return this._value
  }

  equals(other: RouteId): boolean {
    return this._value === other.value
  }

  toString(): string {
    return this._value
  }
}

export class Coordinates {
  constructor(
    private readonly _latitude: number,
    private readonly _longitude: number,
  ) {
    if (isNaN(_latitude) || isNaN(_longitude)) {
      throw new Error("Coordinates must be valid numbers")
    }
  }

  get latitude(): number {
    return this._latitude
  }

  get longitude(): number {
    return this._longitude
  }

  toString(): string {
    return `${this._latitude},${this._longitude}`
  }
}

export enum TransportMode {
  Train = "train",
  Suburban = "suburban",
  Bus = "bus",
  Tram = "tram",
  Metro = "metro",
}
