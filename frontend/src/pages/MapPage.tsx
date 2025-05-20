import React from "react";
import LeafletMap from "@/features/LeafletMap/LeafletMap";
import { DebugPanel } from "@/features/DebugPanel";
import { useLeafletMap } from "@/features/LeafletMap/useLeafletMap";
import { Skeleton, Spin } from "antd";
import { StationsOverlay } from "@/features/StationsOverlay/StationsOverlay";

const MapPage: React.FC = () => {
  const { map, bounds, isMapInitialized } = useLeafletMap();

  return (
    <LeafletMap>
      {bounds ? (
        <StationsOverlay bounds={bounds} />
      ) : (
        <Spin tip="Loading map bounds...">
          <Skeleton.Node active />
        </Spin>
      )}
      {!isMapInitialized && (
        <Spin tip="Loading map...">
          <Skeleton.Node active />
        </Spin>
      )}
      <DebugPanel
        map={map}
        isMapInitialized={isMapInitialized}
        bounds={bounds}
      />
    </LeafletMap>
  );
};

export default MapPage;
