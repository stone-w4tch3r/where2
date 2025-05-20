import React from "react";
import { Circle } from "react-leaflet";
import L from "leaflet";

interface CircleOverlayProps {
  center: [number, number];
  radius: number;
  color?: string;
  fillColor?: string;
  opacity?: number;
  fillOpacity?: number;
}

const CircleOverlay: React.FC<CircleOverlayProps> = ({
  center,
  radius,
  color = "#3388ff",
  fillColor = "#3388ff",
  opacity = 0.5,
  fillOpacity = 0.2,
}) => {
  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color,
        fillColor,
        opacity,
        fillOpacity,
      }}
    />
  );
};

export default CircleOverlay;
