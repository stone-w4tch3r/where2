import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import { MapStateContext } from "./MapStateContext";

interface MapProviderProps {
  children: ReactNode;
}

export const MapStateProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const handleMapUpdate = (
    mapInstance: L.Map,
    boundsInstance: LatLngBounds,
  ): void => {
    setMap(mapInstance);
    setBounds(boundsInstance);
    setIsMapInitialized(true);
  };

  useConnectToLeafletMap(handleMapUpdate);

  return (
    <MapStateContext.Provider value={{ map, isMapInitialized, bounds }}>
      {children}
    </MapStateContext.Provider>
  );
};

const useConnectToLeafletMap = (
  onMapUpdate: (map: L.Map, bounds: LatLngBounds) => void,
): void => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      // Set up event listeners
      map.on("moveend", () => {
        onMapUpdate(map, map.getBounds());
      });

      // Initial notification
      onMapUpdate(map, map.getBounds());
    }
  }, [map, onMapUpdate]);
};
