import { useEffect, useState } from "react";
import { MapDetector } from "./MapDetector";
import type { LatLngBounds, LatLngTuple, Map as LeafletMap } from "leaflet";
import type { DetectedMap, YandexMapInstance } from "./types";

export interface MapDetectionResult {
  maps: DetectedMap[];
  isLoading: boolean;
  error: Error | null;
  refreshMaps: () => void;
  focusMap: (index: number, center: LatLngTuple, zoom: number) => boolean;
  getMapBounds: (index: number) => LatLngBounds | null;
}

/**
 * Hook for detecting and interacting with maps on the page from different providers
 * @returns MapDetectionResult object with detected maps and interaction methods
 */
export function useMapDetection(): MapDetectionResult {
  const [maps, setMaps] = useState<DetectedMap[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshMaps = (): void => {
    try {
      setIsLoading(true);
      const detector = MapDetector.getInstance();
      const detectedMaps = detector.detectMaps();
      setMaps(detectedMaps);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to detect maps"));
      setIsLoading(false);
    }
  };

  /**
   * Focus a specific map by index
   * @param index - Index of the map in the maps array
   * @param center - Center coordinates [lat, lng]
   * @param zoom - Zoom level
   * @returns boolean indicating success
   */
  const focusMap = (
    index: number,
    center: LatLngTuple,
    zoom: number,
  ): boolean => {
    if (index < 0 || index >= maps.length || !maps[index].instance) {
      return false;
    }

    const map = maps[index];

    if (!map.instance) {
      return false;
    }

    try {
      // Different map providers have different APIs
      if (map.type === "leaflet" && "setView" in map.instance) {
        // Leaflet map
        (map.instance as unknown as LeafletMap).setView(center, zoom);
        return true;
      } else if (
        map.type === "google" &&
        "setCenter" in map.instance &&
        "setZoom" in map.instance
      ) {
        // Google map
        const googleMap = map.instance as unknown as google.maps.Map;
        googleMap.setCenter({ lat: center[0], lng: center[1] });
        googleMap.setZoom(zoom);
        return true;
      } else if (map.type === "yandex" && "setCenter" in map.instance) {
        // Yandex map
        const yandexMap = map.instance as unknown as YandexMapInstance;
        yandexMap.setCenter([center[0], center[1]], zoom);
        return true;
      } else {
        console.error(`Unsupported map type: ${map.type}`);
      }
    } catch (err) {
      console.error(`Failed to focus map at index ${index}:`, err);
    }

    return false;
  };

  /**
   * Get the bounds of a specific map
   * @param index - Index of the map in the maps array
   * @returns LatLngBounds object or null if not available
   */
  const getMapBounds = (index: number): LatLngBounds | null => {
    if (index < 0 || index >= maps.length) {
      return null;
    }

    return maps[index].bounds || null;
  };

  // Initial detection
  useEffect(() => {
    refreshMaps();
  }, []);

  return {
    maps,
    isLoading,
    error,
    refreshMaps,
    focusMap,
    getMapBounds,
  };
}
