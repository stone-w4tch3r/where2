import React from "react";
import { MapStateProvider } from "@/contexts/MapStateProvider";
import { useMapStateContext } from "@/contexts/MapStateContext";
import { DebugPanel } from "@/components/DebugPanel";
import { Avatar, Card, Skeleton, Spin } from "antd";
import { StationsOverlay } from "@/components/StationsOverlay/StationsOverlay";
import { env } from "@/config/vite-env";
import { AttributionControl } from "react-leaflet";
import { AbsolutePositionedItem } from "@/components/AbsolutePositionedItem";
import { ThirdPartyMapConnector } from "./ThirdPartyMapConnector";
import { DevMap } from "./DevMap";
import styled from "@emotion/styled";

const StyledDevMap = styled(DevMap)`
  height: 100vh;
  width: 100%;
  background-color: #f0f0f0;
`;

export const MapBuilder: React.FC = () => {
  return (
    <>
      {env.VITE_DEBUG_MODE && (
        <StyledDevMap style={{ height: "80vh", width: "80%" }} />
      )}
      <ThirdPartyMapConnector attributionControl={false}>
        fuuu
        {/* <MapStateProvider> */}
        {/* <AttributionControl position="bottomright" /> */}
        {/* <MapBoundsDetector /> */}
        {/* {env.VITE_DEBUG_MODE && (
          <AbsolutePositionedItem position="bottom-left">
            <DebugPanel />
          </AbsolutePositionedItem>
        )} */}
        {/* <AbsolutePositionedItem position="top-right">
          <PoweredBy />
        </AbsolutePositionedItem> */}
        {/* </MapStateProvider> */}
      </ThirdPartyMapConnector>
    </>
  );
};

const MapBoundsDetector: React.FC = () => {
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
