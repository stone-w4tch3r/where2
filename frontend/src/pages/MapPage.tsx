import React from "react";
import MapContainer from "../components/MapContainer";
import "./MapPage.css";

const MapPage: React.FC = () => {
  return (
    <div className="map-page-layout">
      <MapContainer />
    </div>
  );
};

export default MapPage;
