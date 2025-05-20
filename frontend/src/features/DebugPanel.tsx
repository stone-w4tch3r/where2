import React from "react";

export const DEBUG_MODE = true;

export interface DebugPanelProps {
  map: L.Map | null;
  isMapInitialized: boolean;
  bounds: L.LatLngBounds | null;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  map,
  isMapInitialized,
  bounds,
}) => {
  if (!DEBUG_MODE) return null;

  return (
    <div className="debug-overlay">
      <h3>Debug Info</h3>
      <div>Map Initialized: {isMapInitialized ? "Yes" : "No"}</div>
      <div>Map Instance: {map ? "Available" : "Not Available"}</div>
      <div>Bounds Available: {bounds ? "Yes" : "No"}</div>
      {bounds && (
        <div>
          <div>South: {bounds.getSouth().toFixed(4)}</div>
          <div>North: {bounds.getNorth().toFixed(4)}</div>
          <div>West: {bounds.getWest().toFixed(4)}</div>
          <div>East: {bounds.getEast().toFixed(4)}</div>
        </div>
      )}
    </div>
  );
};
