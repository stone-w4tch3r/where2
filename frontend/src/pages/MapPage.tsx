import { useState } from "react";
import MapContainer from "../components/MapContainer";
import SideMenu from "../components/SideMenu";

const MapPage = () => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-screen">
      <SideMenu
        selectedStation={selectedStation}
        selectedRoute={selectedRoute}
        onStationSelect={setSelectedStation}
        onRouteSelect={setSelectedRoute}
      />
      <MapContainer
        selectedStation={selectedStation}
        selectedRoute={selectedRoute}
        onStationSelect={setSelectedStation}
      />
    </div>
  );
};

export default MapPage;
