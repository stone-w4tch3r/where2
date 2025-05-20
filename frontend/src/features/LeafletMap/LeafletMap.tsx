import React from "react";
import "./LeafletMap.css";

export const MAP_CONTAINER_ID = "map";

export type MapContainerProps = {
  children: React.ReactNode;
};

const LeafletMap: React.FC<MapContainerProps> = ({ children }) => {
  return (
    <div id={MAP_CONTAINER_ID} className="map-container-dimensions">
      {children}
    </div>
  );
};

export default LeafletMap;
