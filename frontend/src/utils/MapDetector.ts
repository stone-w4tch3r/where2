import type { Map as LeafletMap } from "leaflet";

// Placeholder for Yandex Map instance type
interface YandexMapInstance {
  getCenter: () => number[];
  setCenter: (
    center: number[],
    zoom?: number,
    options?: Record<string, unknown>,
  ) => void;
  getZoom: () => number;
  // Add other common Yandex Map methods/properties if known
}

// Placeholder for Yandex Maps API (ymaps global)
interface YandexMapsAPI {
  Map: new (
    element: string | HTMLElement,
    state: Record<string, unknown>, // e.g., { center: [number, number], zoom: number }
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
}

export class MapDetector {
  private static instance: MapDetector;
  private detectedMaps: DetectedMap[] = [];

  private constructor() {}

  public static getInstance(): MapDetector {
    if (!MapDetector.instance) {
      MapDetector.instance = new MapDetector();
    }
    return MapDetector.instance;
  }

  public detectMaps(): DetectedMap[] {
    this.detectedMaps = [];

    // Detect Leaflet maps
    this.detectLeafletMaps();

    // Detect Google maps
    this.detectGoogleMaps();

    // Detect Yandex maps
    this.detectYandexMaps();

    return this.detectedMaps;
  }

  private detectLeafletMaps(): void {
    // Find all elements with the leaflet-container class
    const leafletContainers = document.querySelectorAll(".leaflet-container");

    leafletContainers.forEach((container) => {
      // Check if this is actually a Leaflet map
      if (container instanceof HTMLElement) {
        // Get the Leaflet instance if possible
        // In Leaflet, the instance is often stored in the element's _leaflet_id
        let mapInstance: LeafletMap | null = null;

        if (window.L && container._leaflet_id && window.L.Map) {
          // Try to get the map instance using _leaflet_id
          // @ts-expect-error _mapInstances is not part of the official type definition
          const maps = Object.values(window.L.map?._mapInstances || {});
          mapInstance =
            (maps.find((map) => {
              if (window.L && map instanceof window.L.Map) {
                return map.getContainer() === container;
              }
              return false;
            }) as LeafletMap | undefined) || null;
        }

        this.detectedMaps.push({
          element: container,
          type: "leaflet",
          instance: mapInstance,
        });
      }
    });
  }

  private detectGoogleMaps(): void {
    const possibleMapContainers = document.querySelectorAll(
      'div[class*="map"], div[id*="map"], .gm-style',
    );

    possibleMapContainers.forEach((container) => {
      if (container instanceof HTMLElement) {
        const hasGoogleMapsElements = !!container.querySelector(".gm-style");

        if (hasGoogleMapsElements) {
          let mapInstance: google.maps.Map | null = null;
          // Attempt to find the Google Maps instance
          for (const key in container) {
            if (key.startsWith("__googleMaps$")) {
              const internalInstanceRaw: unknown = (
                container as unknown as Record<string, unknown>
              )[key];
              // Check if internalInstanceRaw and its map property exist and seem like a map instance
              if (
                internalInstanceRaw &&
                typeof internalInstanceRaw === "object" &&
                "map" in internalInstanceRaw &&
                internalInstanceRaw.map != null &&
                typeof internalInstanceRaw.map === "object" &&
                "getCenter" in internalInstanceRaw.map &&
                typeof (internalInstanceRaw.map as { getCenter?: () => void })
                  .getCenter === "function"
              ) {
                mapInstance = internalInstanceRaw.map as google.maps.Map;
                break;
              }
            }
          }

          this.detectedMaps.push({
            element: container,
            type: "google",
            instance: mapInstance,
          });
        }
      }
    });
  }

  private detectYandexMaps(): void {
    // Find all elements with potential Yandex map classes or IDs
    const yandexContainers = document.querySelectorAll(
      '[class*="ymaps-2"], [id*="yandexMap"], [class*="yandex-maps"]',
    );

    yandexContainers.forEach((container) => {
      if (container instanceof HTMLElement) {
        const mapInstance: YandexMapInstance | null = null;

        this.detectedMaps.push({
          element: container,
          type: "yandex",
          instance: mapInstance,
        });
      }
    });
  }
}

declare global {
  interface Window {
    L?: typeof import("leaflet");
    google?: typeof google;
    ymaps?: YandexMapsAPI;
  }

  interface HTMLElement {
    _leaflet_id?: string | number;
  }
}
