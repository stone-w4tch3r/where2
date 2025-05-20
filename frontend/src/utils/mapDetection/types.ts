import { LatLngBounds, Map as LeafletMap } from "leaflet";

export interface YandexMapInstance {
  getCenter: () => { lat: number; lng: number } | [number, number];
  setCenter: (
    center: number[],
    zoom?: number,
    options?: Record<string, unknown>,
  ) => void;
  getZoom: () => number;
  getBounds: () => {
    getLowerLeft: () => [number, number];
    getUpperRight: () => [number, number];
  };
}

export interface YandexMapsAPI {
  Map: new (
    element: string | HTMLElement,
    state: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YandexMapInstance;
}

export type MapType = "leaflet" | "google" | "yandex" | "other";

export interface DetectedMap {
  element: HTMLElement;
  type: MapType;
  instance?:
    | LeafletMap
    | google.maps.Map
    | YandexMapInstance
    | null
    | undefined;
  bounds?: LatLngBounds | null;
}
