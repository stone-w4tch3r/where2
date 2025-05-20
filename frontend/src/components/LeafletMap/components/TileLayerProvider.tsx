import React from "react";
import { TileLayer } from "react-leaflet";
import { env } from "@/config/vite-env";

interface MapProviderConfig {
  tileLayerUrl: string;
  attribution: string;
}

const providers: Record<string, MapProviderConfig> = {
  openstreetmap: {
    tileLayerUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

interface TileLayerProviderProps {
  providerKey?: string;
}

const TileLayerProvider: React.FC<TileLayerProviderProps> = ({
  providerKey = env.VITE_MAP_PROVIDER,
}) => {
  // Get provider config or fallback to OpenStreetMap
  const effectiveProviderKey = providerKey || "openstreetmap";
  const config = providers[effectiveProviderKey] || providers.openstreetmap;

  return (
    <TileLayer url={config.tileLayerUrl} attribution={config.attribution} />
  );
};

export default TileLayerProvider;
