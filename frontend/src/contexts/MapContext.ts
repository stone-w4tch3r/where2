import { createContext, useContext } from "react";
import { LatLngBounds } from "leaflet";

export interface MapContextType {
  map: L.Map | null;
  isMapInitialized: boolean;
  bounds: LatLngBounds | null;
}

export const MapContext = createContext<MapContextType>({
  map: null,
  isMapInitialized: false,
  bounds: null,
});

export const useMapContext = (): MapContextType => useContext(MapContext);
