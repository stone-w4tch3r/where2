import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createTileLayer } from "../lib/mapProviderFactory";
// import { useStore } from '@/store'; // For future dynamic provider switching from Zustand store

const MAP_CONTAINER_ID = "map"; // This ID must match the div in MapContainer component

interface UseMapProviderReturn {
  map: L.Map | null;
  isMapInitialized: boolean;
}

export const useMapProvider = (): UseMapProviderReturn => {
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  // const mapProviderKeyFromStore = useStore((state) => state.mapSlice.mapProvider); // Future: get from store

  useEffect(() => {
    // Ensure this effect runs only in the browser and the map container element exists
    if (
      typeof window === "undefined" ||
      !document.getElementById(MAP_CONTAINER_ID)
    ) {
      return;
    }

    // Initialize map only once
    if (!mapRef.current) {
      const mapInstance = L.map(MAP_CONTAINER_ID).setView(
        [56.838, 60.5975],
        12,
      ); // Default: Yekaterinburg
      mapRef.current = mapInstance;
      setIsMapInitialized(true);
    }

    // Handle tile layer creation and updates
    // For now, it uses the default provider from env. Later, mapProviderKeyFromStore can trigger changes.
    const currentMap = mapRef.current;
    if (currentMap) {
      const newTileLayer = createTileLayer(); // Uses env.VITE_MAP_PROVIDER by default

      if (newTileLayer) {
        if (tileLayerRef.current) {
          tileLayerRef.current.remove(); // Remove old tile layer if exists
        }
        newTileLayer.addTo(currentMap);
        tileLayerRef.current = newTileLayer;
      } else {
        console.error(
          "Failed to create tile layer. Map might be empty or use a default.",
        );
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
      // Do not remove the map instance here if it should persist across re-renders or navigations
      // mapRef.current?.remove(); mapRef.current = null;
      // Tile layer is managed above, removing it if it changes or on component unmount if map itself is removed.
    };
    // }, [mapProviderKeyFromStore]); // Re-run if mapProviderKeyFromStore changes in the future
  }, []); // Empty dependency array: runs once on mount to initialize map and set up resize listener

  return { map: mapRef.current, isMapInitialized };
};
