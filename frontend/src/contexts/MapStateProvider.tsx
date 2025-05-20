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

// React-Leaflet provider component
const ReactLeafletProvider: React.FC<{
  children: ReactNode;
  onMapInitialized: (map: L.Map, bounds: LatLngBounds) => void;
}> = ({ children, onMapInitialized }) => {
  // Get the map instance from React Leaflet context
  const map = useMap();

  useEffect(() => {
    if (map) {
      // Set up event listeners
      map.on("moveend", () => {
        onMapInitialized(map, map.getBounds());
      });

      // Initial notification
      onMapInitialized(map, map.getBounds());
    }
  }, [map, onMapInitialized]);

  return <>{children}</>;
};

interface MapProviderProps {
  children: ReactNode;
}

export const MapStateProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const handleMapInitialized = (
    mapInstance: L.Map,
    boundsInstance: LatLngBounds,
  ): void => {
    setMap(mapInstance);
    setBounds(boundsInstance);
    setIsMapInitialized(true);
  };

  return (
    <MapStateContext.Provider value={{ map, isMapInitialized, bounds }}>
      <ReactLeafletProvider onMapInitialized={handleMapInitialized}>
        {children}
      </ReactLeafletProvider>
    </MapStateContext.Provider>
  );
};
