import React from "react";
import { MapStateProvider } from "@/contexts/MapStateProvider";
import { useMapStateContext } from "@/contexts/MapStateContext";
import { DebugPanel } from "@/components/DebugPanel";
import { Avatar, Card, Skeleton, Spin } from "antd";
import { StationsOverlay } from "@/components/StationsOverlay/StationsOverlay";
import { env } from "@/config/vite-env";
import { MapContainer, AttributionControl, TileLayer } from "react-leaflet";
import styled from "@emotion/styled";
import { AbsolutePositionedItem } from "@/components/AbsolutePositionedItem";
import { useTileLayer } from "@/utils/useTileLayer";

const StyledMapContainer = styled(MapContainer)`
  height: 100vh;
  width: 100%;
  background-color: #f0f0f0;
`;

export const MapBuilder: React.FC = () => {
  const center: [number, number] = [56.838, 60.5975]; // Default: Yekaterinburg
  const zoom = 12;

  // const { TileLayer, error, isLoading, refreshMaps } = useTileLayer();

  // if (isLoading || !TileLayer) {
  //   return (
  //     <AbsolutePositionedItem position="center">
  //       <Spin tip="Detecting and loading map..." />
  //     </AbsolutePositionedItem>
  //   );
  // }

  return (
    <StyledMapContainer center={center} zoom={zoom} attributionControl={false}>
      <MapStateProvider>
        <AttributionControl position="bottomright" />
        {/* <TileLayerElement /> */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <StationsOverlayWithLoader />

        {env.VITE_DEBUG_MODE && (
          <AbsolutePositionedItem position="bottom-left">
            <DebugPanel />
          </AbsolutePositionedItem>
        )}

        <AbsolutePositionedItem position="top-right">
          <PoweredBy />
        </AbsolutePositionedItem>
      </MapStateProvider>
    </StyledMapContainer>
  );
};

// Stations overlay with loading state
const StationsOverlayWithLoader: React.FC = () => {
  const { bounds, isMapInitialized } = useMapStateContext();

  if (!isMapInitialized) {
    return (
      <AbsolutePositionedItem position="center">
        <Spin tip="Loading map...">
          <Skeleton.Node active />
        </Spin>
      </AbsolutePositionedItem>
    );
  }

  if (!bounds) {
    return (
      <AbsolutePositionedItem position="center">
        <Spin tip="Loading map bounds...">
          <Skeleton.Node active />
        </Spin>
      </AbsolutePositionedItem>
    );
  }

  return <StationsOverlay bounds={bounds} />;
};

const PoweredBy: React.FC = () => {
  return (
    <Card title="Powered by">
      <Card.Meta
        avatar={
          <Avatar src="https://avatars.githubusercontent.com/u/103541904?v=4" />
        }
        title="Extension credits"
        description="Extension credits"
      />
    </Card>
  );
};
