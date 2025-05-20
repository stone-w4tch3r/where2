import type { Map as LeafletMap, LatLngBounds } from "leaflet";
import type { DetectedMap, YandexMapInstance, YandexMapsAPI } from "./types";

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

  leafletContainers.forEach((container) => {
    if (container instanceof HTMLElement) {
      let mapInstance: LeafletMap | null = null;
      let bounds: LatLngBounds | null = null;

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

        // If we found a map instance, get its bounds
        if (mapInstance) {
          try {
            bounds = mapInstance.getBounds();
          } catch (e) {
            console.warn("Could not get bounds from Leaflet map:", e);
          }
        }
      }

      if (mapInstance && bounds) {
        return {
          element: container,
          type: "leaflet",
          instance: mapInstance,
          bounds,
        };
      }
    }
  });

  return null;
};

const detectGoogleMaps = (): DetectedMap | null => {
  const possibleMapContainers = document.querySelectorAll(
    'div[class*="map"], div[id*="map"], .gm-style',
  );

  possibleMapContainers.forEach((container) => {
    if (container instanceof HTMLElement) {
      // Google Maps has a specific style class
      const hasGoogleMapsElements = !!container.querySelector(".gm-style");

      if (hasGoogleMapsElements) {
        let mapInstance: google.maps.Map | null = null;
        let bounds: LatLngBounds | null = null;

        // Method 1: Look for Google Maps instance in internal props
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

                // Create Leaflet-compatible bounds from Google bounds
                if (mapInstance && window.L) {
                  try {
                    const googleBounds = mapInstance.getBounds();
                    if (googleBounds) {
                      const ne = googleBounds.getNorthEast();
                      const sw = googleBounds.getSouthWest();
                      bounds = window.L.latLngBounds(
                        window.L.latLng(sw.lat(), sw.lng()),
                        window.L.latLng(ne.lat(), ne.lng()),
                      );
                    }
                  } catch (e) {
                    console.warn("Could not get bounds from Google map:", e);
                  }
                }

                break;
              }
            } catch (e) {
              console.error("Error accessing Google Maps instance:", e);
            }
          }
        }

        if (mapInstance && bounds) {
          return {
            element: container,
            type: "google",
            instance: mapInstance,
            bounds,
          };
        }
      }
    }
  });

  return null;
};

const detectYandexMaps = (): DetectedMap | null => {
  // Find all elements with potential Yandex map classes or IDs
  const yandexContainers = document.querySelectorAll(
    '[class*="ymaps"], [id*="yandexMap"], [class*="yandex-map"]',
  );

  yandexContainers.forEach((container) => {
    if (container instanceof HTMLElement) {
      let mapInstance: YandexMapInstance | null = null;
      let bounds: LatLngBounds | null = null;

      // Try to find the Yandex Maps instance
      if (window.ymaps) {
        // Look for Yandex maps instances in the container
        for (const key in container) {
          if (key.startsWith("__yandexMap$") || key.includes("ymaps")) {
            try {
              const possibleInstance = (
                container as unknown as Record<
                  string,
                  YandexMapInstance | unknown
                >
              )[key];
              if (
                possibleInstance &&
                typeof possibleInstance === "object" &&
                "getCenter" in possibleInstance &&
                typeof possibleInstance.getCenter === "function" &&
                "getZoom" in possibleInstance &&
                typeof possibleInstance.getZoom === "function"
              ) {
                mapInstance = possibleInstance as YandexMapInstance;

                // Create Leaflet-compatible bounds from Yandex bounds
                if (mapInstance && window.L && mapInstance.getBounds) {
                  try {
                    const yandexBounds = mapInstance.getBounds();
                    const lowerLeft = yandexBounds.getLowerLeft();
                    const upperRight = yandexBounds.getUpperRight();

                    bounds = window.L.latLngBounds(
                      window.L.latLng(lowerLeft[0], lowerLeft[1]),
                      window.L.latLng(upperRight[0], upperRight[1]),
                    );
                  } catch (e) {
                    console.warn("Could not get bounds from Yandex map:", e);
                  }
                }

                break;
              }
            } catch (e) {
              console.error("Error accessing Yandex Maps instance:", e);
            }
          }
        }
      }

      if (mapInstance && bounds) {
        return {
          element: container,
          type: "yandex",
          instance: mapInstance,
          bounds,
        };
      }
    }
  });

  return null;
};

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
