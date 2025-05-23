import type { Map as LeafletMap } from "leaflet";
import type { Map as YandexMap } from "yandex-maps";
import type ymaps from "yandex-maps";

export type DetectedMap =
  | { element: HTMLElement; type: "leaflet"; instance: LeafletMap }
  | { element: HTMLElement; type: "google"; instance: google.maps.Map }
  | { element: HTMLElement; type: "yandex"; instance: YandexMap };

export type MapType = DetectedMap["type"];

export const detectMaps = (): DetectedMap[] => {
  const detectedMaps = [
    detectLeafletMaps(),
    detectGoogleMaps(),
    detectYandexMaps(),
  ];

  return detectedMaps.filter((map) => map !== null);
};

const detectLeafletMaps = (): DetectedMap | null => {
  // Find all elements with the leaflet-container class
  const leafletContainers = document.querySelectorAll(".leaflet-container");

  for (const container of leafletContainers) {
    if (container instanceof HTMLElement) {
      let mapInstance: LeafletMap | null = null;

      // Try to find the Leaflet instance
      if (window.L) {
        // Method 1: Using _leaflet_id
        if (container._leaflet_id && window.L.Map) {
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
      }

      if (mapInstance) {
        return {
          element: container,
          type: "leaflet",
          instance: mapInstance,
        };
      }
    }
  }

  return null;
};

const detectGoogleMaps = (): DetectedMap | null => {
  const possibleMapContainers = document.querySelectorAll(
    'div[class*="map"], div[id*="map"], .gm-style',
  );

  for (const container of possibleMapContainers) {
    if (container instanceof HTMLElement) {
      // Google Maps has a specific style class
      const hasGoogleMapsElements = !!container.querySelector(".gm-style");

      if (hasGoogleMapsElements) {
        let mapInstance: google.maps.Map | null = null;

        // Look for Google Maps instance in internal props
        for (const key in container) {
          if (
            key.startsWith("__googleMaps$") ||
            key.startsWith("__reactFiber$")
          ) {
            try {
              const internalInstanceRaw: unknown = (
                container as unknown as Record<string, unknown>
              )[key];

              // Check for map property with expected Google Maps API methods
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
            } catch (e) {
              console.error("Error accessing Google Maps instance:", e);
            }
          }
        }

        if (mapInstance) {
          return {
            element: container,
            type: "google",
            instance: mapInstance,
          };
        }
      }
    }
  }

  return null;
};

const detectYandexMaps = (): DetectedMap | null => {
  // Find all elements with potential Yandex map classes or IDs
  const yandexContainers = document.querySelectorAll(
    '[class*="ymaps"], [id*="yandexMap"], [class*="yandex-map"]',
  );

  for (const container of yandexContainers) {
    if (container instanceof HTMLElement) {
      let mapInstance: YandexMap | null = null;

      // Try to find the Yandex Maps instance
      if (window.ymaps) {
        // Look for Yandex maps instances in the container
        for (const key in container) {
          if (key.startsWith("__yandexMap$") || key.includes("ymaps")) {
            try {
              const possibleInstance = (
                container as unknown as Record<string, YandexMap | unknown>
              )[key];
              if (
                possibleInstance &&
                typeof possibleInstance === "object" &&
                "getCenter" in possibleInstance &&
                typeof possibleInstance.getCenter === "function" &&
                "getZoom" in possibleInstance &&
                typeof possibleInstance.getZoom === "function"
              ) {
                mapInstance = possibleInstance as YandexMap;

                break;
              }
            } catch (e) {
              console.error("Error accessing Yandex Maps instance:", e);
            }
          }
        }
      }

      if (mapInstance) {
        return {
          element: container,
          type: "yandex",
          instance: mapInstance,
        };
      }
    }
  }

  return null;
};

declare global {
  interface Window {
    L?: typeof import("leaflet");
    google?: typeof google;
    ymaps?: typeof ymaps;
  }

  interface HTMLElement {
    _leaflet_id?: string | number;
  }
}
