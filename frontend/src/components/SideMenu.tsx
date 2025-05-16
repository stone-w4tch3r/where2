import { useState } from "react";
import { Menu, Input, Slider, Switch, Divider } from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";

interface SideMenuProps {
  selectedStation: string | null;
  selectedRoute: string | null;
  onStationSelect: (stationId: string | null) => void;
  onRouteSelect: (routeId: string | null) => void;
}

const SideMenu = ({
  selectedStation,
  selectedRoute,
  onStationSelect,
  onRouteSelect,
}: SideMenuProps) => {
  const [circleRadius, setCircleRadius] = useState<number>(1);
  const [maxTransfers, setMaxTransfers] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  return (
    <div className="w-64 bg-white shadow-md p-4 overflow-auto">
      <h1 className="text-xl font-bold mb-4">Where2</h1>

      <Divider orientation="left">Overlay</Divider>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span>Show Overlay</span>
          <Switch checked={showOverlay} onChange={setShowOverlay} />
        </div>
      </div>

      <Divider orientation="left">Coverage</Divider>
      <div className="mb-4">
        <div className="mb-2">Circle Radius (km)</div>
        <Slider
          min={0.5}
          max={5}
          step={0.5}
          value={circleRadius}
          onChange={setCircleRadius}
          tooltip={{ formatter: (value) => `${value} km` }}
        />
      </div>

      <Divider orientation="left">Transfers</Divider>
      <div className="mb-4">
        <div className="mb-2">Max Transfers</div>
        <Slider
          min={0}
          max={3}
          value={maxTransfers}
          onChange={setMaxTransfers}
          marks={{ 0: "0", 1: "1", 2: "2", 3: "3" }}
        />
      </div>

      <Divider orientation="left">Search</Divider>
      <Input
        placeholder="Search stations..."
        prefix={<SearchOutlined />}
        className="mb-4"
      />

      {/* Station and route lists will be added here */}
    </div>
  );
};

export default SideMenu;
