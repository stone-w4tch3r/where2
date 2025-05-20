import { useStations } from "@/components/StationsOverlay/useStations";
import { Skeleton, Spin } from "antd";
import { Typography } from "antd";

type StationsOverlayProps = {
  bounds: L.LatLngBounds;
};

export const StationsOverlay: React.FC<StationsOverlayProps> = ({ bounds }) => {
  const { stations, isLoading, isError, error } = useStations(bounds);

  if (isLoading)
    return (
      <Spin tip="Loading stations...">
        <Skeleton.Node active />
      </Spin>
    );
  if (isError)
    return (
      <Typography.Text type="danger">Error: {error?.message}</Typography.Text>
    );

  return (
    <div>
      {stations.map((station) => (
        <div key={station.id}>{station.fullName}</div>
      ))}
    </div>
  );
};
