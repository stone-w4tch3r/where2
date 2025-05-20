import React from "react";
import LeafletMap from "@/components/LeafletMap/LeafletMap";
import { DebugPanel } from "@/components/DebugPanel";
import { useLeafletMap } from "@/components/LeafletMap/useLeafletMap";
import { Skeleton, Spin } from "antd";
import { StationsOverlay } from "@/components/StationsOverlay/StationsOverlay";

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
