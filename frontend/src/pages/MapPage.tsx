import React from "react";
import { MapProvider, useMapContext } from "@/components/MapProvider";
import { DebugPanel } from "@/components/DebugPanel";
import { Avatar, Card, Skeleton, Spin } from "antd";
import { StationsOverlay } from "@/components/StationsOverlay/StationsOverlay";
import { env } from "@/config/vite-env";
import { MapContainer, AttributionControl } from "react-leaflet";
import styled from "@emotion/styled";
import TileLayerProvider from "@/components/LeafletMap/components/TileLayerProvider";
import { MapOverlay } from "@/components/MapOverlay";

const StyledMapContainer = styled(MapContainer)`
  height: 100vh;
  width: 100%;
  background-color: #f0f0f0;
`;

const MapPage: React.FC = () => {
  const center: [number, number] = [56.838, 60.5975]; // Default: Yekaterinburg
  const zoom = 12;

  return (
    <StyledMapContainer center={center} zoom={zoom} attributionControl={false}>
      <MapProvider isReactLeafletContext={true}>
        <TileLayerProvider />
        <AttributionControl position="bottomright" />
        <StationsOverlayWithLoader />

        {env.VITE_DEBUG_MODE && (
          <MapOverlay position="bottom-left">
            <DebugPanel />
          </MapOverlay>
        )}

        <MapOverlay position="top-right">
          <Card title="Powered by">
            <Card.Meta
              avatar={
                <Avatar src="https://avatars.githubusercontent.com/u/103541904?v=4" />
              }
              title="Extension credits"
              description="Extension credits"
            />
          </Card>
        </MapOverlay>
      </MapProvider>
    </StyledMapContainer>
  );
};

// Stations overlay with loading state
const StationsOverlayWithLoader: React.FC = () => {
  const { bounds, isMapInitialized } = useMapContext();

  if (!isMapInitialized) {
    return (
      <MapOverlay position="center">
        <Spin tip="Loading map...">
          <Skeleton.Node active />
        </Spin>
      </MapOverlay>
    );
  }

  if (!bounds) {
    return (
      <MapOverlay position="center">
        <Spin tip="Loading map bounds...">
          <Skeleton.Node active />
        </Spin>
      </MapOverlay>
    );
  }

  return <StationsOverlay bounds={bounds} />;
};

export default MapPage;
