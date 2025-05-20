import React from "react";
import styled from "@emotion/styled";

export const MAP_CONTAINER_ID = "map";

export type MapContainerProps = {
  children: React.ReactNode;
};

const MapContainer = styled.div`
  height: 100vh; /* Default to full viewport height */
  width: 100%;
  background-color: #f0f0f0; /* Light grey background as a visual cue before map tiles load */
  position: relative; /* For positioning overlays */

  /* Leaflet dynamically adds this class to its container */
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

const LeafletMap: React.FC<MapContainerProps> = ({ children }) => {
  return <MapContainer id={MAP_CONTAINER_ID}>{children}</MapContainer>;
};

export default LeafletMap;
