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

// Yandex Maps API
export interface YandexMapsAPI {
  Map: new (
    element: string | HTMLElement,
    state: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YandexMapInstance;
  // Add other ymaps API elements if needed
}

export interface DetectedMap {
  element: HTMLElement;
  type: "leaflet" | "google" | "yandex" | "other";
  instance?:
    | LeafletMap
    | google.maps.Map
    | YandexMapInstance
    | null
    | undefined;
  bounds?: LatLngBounds | null;
}
