import { useState, useEffect } from "react";
import L from "leaflet";
import { useLeafletMapInitialization } from "./useLeafletMapInitialization";

export interface MapState {
  map: L.Map | null;
  bounds: L.LatLngBounds | null;
  isMapInitialized: boolean;
}

export const useLeafletMap = (): MapState => {
  const { isMapInitialized, map } = useLeafletMapInitialization();
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (!map) return;

    const updateBounds = (): void => {
      const newBounds = map.getBounds();
      setBounds(newBounds);
    };

    // Get initial bounds
    updateBounds();

    // Set up event listeners
    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);

    return (): void => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map]);

  return {
    map,
    bounds,
    isMapInitialized,
  };
};
