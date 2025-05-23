import React from "react";
import { useStations } from "@/components/StationsOverlay/useStations";
import { CircleMarker, Tooltip, LayerGroup } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import { AbsolutePositionedItem } from "@/components/AbsolutePositionedItem";
import { Spin, Skeleton, Typography } from "antd";
import { errorToString } from "@/utils/errorHelpers";

type StationsOverlayProps = {
  bounds: LatLngBounds;
};

export const StationsOverlay: React.FC<StationsOverlayProps> = ({ bounds }) => {
  const { stations, isLoading, error } = useStations(bounds);

  if (isLoading) {
    return (
      <AbsolutePositionedItem position="center">
        <Spin tip="Loading stations...">
          <Skeleton.Node active />
        </Spin>
      </AbsolutePositionedItem>
    );
  }

  if (error) {
    return (
      <AbsolutePositionedItem position="center">
        <Typography.Text type="danger">
          Error loading stations: {errorToString(error)}
        </Typography.Text>
      </AbsolutePositionedItem>
    );
  }

  return (
    <LayerGroup>
      {stations.map((station) => {
        if (station.latitude && station.longitude) {
          return (
            <CircleMarker
              key={station.id}
              center={[station.latitude, station.longitude]}
              radius={6}
              pathOptions={{
                fillColor: "#ff4500",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
              }}
            >
              <Tooltip>{station.fullName}</Tooltip>
            </CircleMarker>
          );
        }
        return null;
      })}
    </LayerGroup>
  );
};
