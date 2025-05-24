import React from "react";
import { useStations } from "@/components/StationsOverlay/useStations";
import { CircleMarker, Tooltip, LayerGroup } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import { errorToString } from "@/utils/errorHelpers";
import { AbsolutePositionedSpinner } from "../AbsolutePositionedSpinner";
import { AbsolutePositionedErrorText } from "@/api/AbsolutePositionedErrorText";

type StationsOverlayProps = {
  bounds: LatLngBounds;
};

export const StationsOverlay: React.FC<StationsOverlayProps> = ({ bounds }) => {
  const { stations, isLoading, error } = useStations(bounds);

  if (isLoading) {
    return <AbsolutePositionedSpinner tip="Loading stations..." />;
  }

  if (error) {
    return (
      <AbsolutePositionedErrorText
        message={`Error loading stations: ${errorToString(error)}`}
      />
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
