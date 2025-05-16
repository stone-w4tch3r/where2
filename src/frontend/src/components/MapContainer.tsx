import { useEffect, useState } from "react";
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useMapProvider from "../hooks/useMapProvider";

interface MapContainerProps {
  selectedStation: string | null;
  selectedRoute: string | null;
  onStationSelect: (stationId: string | null) => void;
}

const MapContainer = ({
  selectedStation,
  selectedRoute,
  onStationSelect,
}: MapContainerProps) => {
  const { tileLayer } = useMapProvider();

  return (
    <div className="flex-1 h-full">
      <LeafletMap
        center={[56.8389, 60.6057]} // Yekaterinburg coordinates
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />
        {/* Station markers will be added here */}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;
