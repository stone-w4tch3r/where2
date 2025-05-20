import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createTileLayer } from "./mapProviderFactory";
import { MAP_CONTAINER_ID } from "@/components/LeafletMap/LeafletMap";

interface UseMapContainerReturn {
  map: L.Map | null;
  isMapInitialized: boolean;
}

// For TypeScript to recognize Leaflet's custom properties on HTMLElement
interface LeafletHTMLElement extends HTMLElement {
  _leaflet_id?: number;
}

export const useLeafletMapInitialization = (): UseMapContainerReturn => {
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  useEffect(() => {
    // Ensure this effect runs only in the browser and the map container element exists
    const mapContainer = document.getElementById(
      MAP_CONTAINER_ID,
    ) as LeafletHTMLElement;
    if (typeof window === "undefined" || !mapContainer) {
      return;
    }

    // Check if the map is already initialized on this container
    if (mapContainer._leaflet_id) {
      // Find the existing map instance
      const existingMap = L.DomUtil.get(MAP_CONTAINER_ID) as any;
      if (existingMap && existingMap._leaflet && !mapRef.current) {
        mapRef.current = existingMap._leaflet;
        setIsMapInitialized(true);
      }
      return;
    }

    // Initialize map only once
    if (!mapRef.current) {
      try {
        const mapInstance = L.map(MAP_CONTAINER_ID).setView(
          [56.838, 60.5975],
          12,
        ); // Default: Yekaterinburg
        mapRef.current = mapInstance;
        setIsMapInitialized(true);

        // Handle tile layer creation
        const newTileLayer = createTileLayer();
        if (newTileLayer) {
          newTileLayer.addTo(mapInstance);
          tileLayerRef.current = newTileLayer;
        } else {
          console.error(
            "Failed to create tile layer. Map might be empty or use a default.",
          );
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        return;
      }
    }

    // Handle window resize to invalidate map size
    const resizeHandler = (): void => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", resizeHandler);

    // Cleanup function
    return (): void => {
      window.removeEventListener("resize", resizeHandler);

      // Don't clean up the map on unmount if using React strict mode
      // This prevents issues with double-mounting in development
      // For production, we might want to uncomment this cleanup

      /*
      if (mapRef.current) {
        // Remove the tile layer first
        if (tileLayerRef.current) {
          tileLayerRef.current.remove();
          tileLayerRef.current = null;
        }

        // Then remove the map
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapInitialized(false);
      }
      */
    };
  }, []); // runs once on mount

  return { map: mapRef.current, isMapInitialized };
};
