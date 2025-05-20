import { createContext, useContext } from "react";
import { LatLngBounds } from "leaflet";

export interface MapStateContextType {
  map: L.Map | null;
  isMapInitialized: boolean;
  bounds: LatLngBounds | null;
}

export const MapStateContext = createContext<MapStateContextType>({
  map: null,
  isMapInitialized: false,
  bounds: null,
});

export const useMapStateContext = (): MapStateContextType =>
  useContext(MapStateContext);
