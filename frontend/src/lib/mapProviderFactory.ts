import L from "leaflet";
import { env } from "../config/env";

interface MapProviderConfig {
  tileLayerUrl: string;
  options: L.TileLayerOptions;
}

const providers: Record<string, MapProviderConfig> = {
  openstreetmap: {
    tileLayerUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  // Future providers like Yandex, Google can be added here
  // yandex:
  //   tileLayerUrl: '...',
  //   options: { ... }
  // },
};

export const getMapProviderConfig = (
  providerKey: string = env.VITE_MAP_PROVIDER,
): MapProviderConfig | undefined => {
  return providers[providerKey];
};

export const createTileLayer = (providerKey?: string): L.TileLayer | null => {
  const effectiveProviderKey = providerKey || env.VITE_MAP_PROVIDER;
  const config = getMapProviderConfig(effectiveProviderKey);

  if (!config) {
    console.error(
      `Map provider config for "${effectiveProviderKey}" not found. Trying OpenStreetMap as a fallback.`,
    );
    // Attempt to fallback to OpenStreetMap if the desired one isn't found
    const fallbackConfig = providers["openstreetmap"];
    if (fallbackConfig) {
      return new L.TileLayer(
        fallbackConfig.tileLayerUrl,
        fallbackConfig.options,
      );
    }
    console.error(
      "Fallback OpenStreetMap provider config not found either. Cannot create tile layer.",
    );
    return null;
  }
  return new L.TileLayer(config.tileLayerUrl, config.options);
};
