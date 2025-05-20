import React from "react";
import { useMapContext } from "./MapProvider";
import { Card, Descriptions, Tag } from "antd";

export const DebugPanel: React.FC = () => {
  const { map, isMapInitialized, bounds: leafletBounds } = useMapContext();

  const info = {
    zoom: map && map.getZoom()?.toFixed(2),
    center: map
      ? {
          lat: map.getCenter()?.lat.toFixed(4),
          lng: map.getCenter()?.lng.toFixed(4),
        }
      : null,
    bounds: leafletBounds
      ? {
          n: leafletBounds.getNorth().toFixed(2),
          s: leafletBounds.getSouth().toFixed(2),
          e: leafletBounds.getEast().toFixed(2),
          w: leafletBounds.getWest().toFixed(2),
        }
      : null,
  };

  return (
    <Card
      title="Debug Info"
      size="small"
      extra={
        <Tag color={isMapInitialized ? "success" : "error"}>
          {isMapInitialized ? "Ready" : "Not Ready"}
        </Tag>
      }
    >
      <Descriptions size="small" column={1} bordered>
        {info.center ? (
          <>
            <Descriptions.Item label="Center">
              {info.center.lat}, {info.center.lng}
            </Descriptions.Item>
          </>
        ) : (
          <Descriptions.Item label="Map">Not initialized</Descriptions.Item>
        )}

        <Descriptions.Item label="Zoom">
          {info.zoom ? info.zoom : "Not initialized"}
        </Descriptions.Item>

        <Descriptions.Item label="Bounds">
          {info.bounds
            ? `N: ${info.bounds.n}, S: ${info.bounds.s}, E: ${info.bounds.e}, W: ${info.bounds.w}`
            : "No bounds"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
