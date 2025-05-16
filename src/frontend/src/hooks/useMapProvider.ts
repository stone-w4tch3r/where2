import { useState } from "react";

type MapProvider = "osm" | "google" | "yandex";

interface TileLayerConfig {
  url: string;
  attribution: string;
}

const tileLayerConfigs: Record<MapProvider, TileLayerConfig> = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  google: {
    url: "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps",
  },
  yandex: {
    // This is a placeholder, Yandex Maps requires a specific plugin
    url: "https://core-renderer-tiles.maps.yandex.net/tiles?l=map&v=23.03.27-0&x={x}&y={y}&z={z}",
    attribution: "&copy; Yandex Maps",
  },
};

const useMapProvider = () => {
  const [provider, setProvider] = useState<MapProvider>("osm");

  const changeProvider = (newProvider: MapProvider) => {
    setProvider(newProvider);
  };

  return {
    provider,
    changeProvider,
    tileLayer: tileLayerConfigs[provider],
  };
};

export default useMapProvider;
