import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";

// Types
export interface MapContextType {
  map: L.Map | null;
  isMapInitialized: boolean;
  bounds: LatLngBounds | null;
}

// Context
export const MapContext = createContext<MapContextType>({
  map: null,
  isMapInitialized: false,
  bounds: null,
});

export const useMapContext = (): MapContextType => useContext(MapContext);

// React-Leaflet provider component
const ReactLeafletProvider: React.FC<{
  children: ReactNode;
  onMapInitialized: (map: any, bounds: LatLngBounds) => void;
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
  isReactLeafletContext?: boolean;
}

export const MapProvider: React.FC<MapProviderProps> = ({
  children,
  isReactLeafletContext = false,
}) => {
  const [map, setMap] = useState<any | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const handleMapInitialized = (
    mapInstance: any,
    boundsInstance: LatLngBounds,
  ): void => {
    setMap(mapInstance);
    setBounds(boundsInstance);
    setIsMapInitialized(true);
  };

  return (
    <MapContext.Provider value={{ map, isMapInitialized, bounds }}>
      {isReactLeafletContext ? (
        <ReactLeafletProvider onMapInitialized={handleMapInitialized}>
          {children}
        </ReactLeafletProvider>
      ) : (
        children
      )}
    </MapContext.Provider>
  );
};
