import React from "react";
import { useMapProvider } from "../../hooks/useMapProvider";
import "./MapContainer.css";

const MAP_CONTAINER_ID = "map"; // Must match the ID used in useMapProvider

const MapContainer: React.FC = () => {
  // The useMapProvider hook initializes the map on the element with ID 'map'
  // and handles its lifecycle.
  useMapProvider();

  // The div for the map. Its ID is crucial for the map initialization logic in useMapProvider.
  // The className is for applying dimensions and basic styling via MapContainer.css.
  return <div id={MAP_CONTAINER_ID} className="map-container-dimensions" />;
};

export default MapContainer;
