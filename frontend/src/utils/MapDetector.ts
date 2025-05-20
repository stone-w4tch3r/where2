// Utility to detect maps on webpages

export interface DetectedMap {
  element: HTMLElement;
  type: "leaflet" | "google" | "other";
  instance?: any;
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
        let mapInstance = null;
        if (window.L && container._leaflet_id && window.L.map) {
          // Try to get the map instance using _leaflet_id
          const maps = Object.values(window.L.map._mapInstances || {});
          mapInstance = maps.find((map) => map._container === container);
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
    // Find all possible Google Maps containers
    // Google Maps usually have class names containing "map" or specific Google Maps classes
    const possibleMapContainers = document.querySelectorAll(
      'div[class*="map"], div[id*="map"], .gm-style',
    );

    possibleMapContainers.forEach((container) => {
      if (container instanceof HTMLElement) {
        // Check if this element contains Google Maps elements
        const hasGoogleMapsElements = !!container.querySelector(".gm-style");

        if (hasGoogleMapsElements) {
          // This is likely a Google Map
          this.detectedMaps.push({
            element: container,
            type: "google",
          });
        }
      }
    });
  }
}

// Add type definitions to the global Window interface
declare global {
  interface Window {
    L?: {
      map: {
        _mapInstances?: Record<string, any>;
      } & Function;
    };
  }

  interface HTMLElement {
    _leaflet_id?: string | number;
  }
}
