import type { Map as LeafletMap } from "leaflet";
/// <reference types="@types/google.maps" />

// We are having trouble getting the TS compiler to recognize google.maps types.
// Using 'any' as a temporary measure for google.maps.Map.
// Ensure '@types/google.maps' is installed and try restarting the TS server/Vite dev server.

export interface DetectedMap {
  element: HTMLElement;
  type: "leaflet" | "google" | "yandex" | "other";
  instance?: LeafletMap | any | unknown | null | undefined; 
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
          let mapInstance: any | null = null; // Using any for google.maps.Map temporarily
          // Attempt to find the Google Maps instance
          for (const key in container) {
            if (key.startsWith("__googleMaps$")) {
              const internalInstance = (container as any)[key];
              // Check if internalInstance and its map property exist and seem like a map instance
              if (
                internalInstance &&
                typeof internalInstance === "object" &&
                internalInstance.map &&
                typeof internalInstance.map.getCenter === "function"
              ) {
                mapInstance = internalInstance.map;
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
        const mapInstance: unknown = null;

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
    google?: any; // Using any for google global temporarily
    ymaps?: any;
  }

  interface HTMLElement {
    _leaflet_id?: string | number;
  }
}
