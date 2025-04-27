export enum TransportMode {
  Train = "train",
  Suburban = "suburban",
  Bus = "bus",
  Tram = "tram",
  Metro = "metro",
}

export interface Station {
  id: string
  fullName: string
  popularName: string | null
  shortName: string | null
  transportMode: TransportMode
  location: {
    latitude: number
    longitude: number
  }
  country: string
  region: string
}
