import React, { useEffect, useMemo, useState } from "react";
import { TileLayer as MapTileLayer, TileLayer } from "react-leaflet";
import { createLayerComponent } from "@react-leaflet/core";
import L from "leaflet";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import "leaflet-plugins/layer/tile/Yandex";
import { useDetectMaps } from "./mapDetection/useDetectMaps";
import { MapType } from "./mapDetection/detectMaps";
import { errorToString } from "./errorHelpers";

interface YandexLayerProps extends Omit<L.TileLayerOptions, "type"> {
  type?: string;
}

type GoogleLayerComponent = typeof ReactLeafletGoogleLayer;

interface ExtendedL {
  yandex: (type: string, options?: YandexLayerProps) => L.TileLayer;
}

type MapTileLayer = React.JSX.Element;

type ReturnType = {
  TileLayer: MapTileLayer | null;
  error: string | null;
  isLoading: boolean;
  refreshMaps: () => void;
};

export const useCreateMapProvider: () => ReturnType = () => {
  const [selectedMapType, setSelectedMapType] = useState<MapType | null>(null);
  const [tileLayerError, setTileLayerError] = useState<string | null>(null);
  const {
    maps,
    isLoading,
    error: mapDetectionError,
    refreshMaps: refreshMapsDetection,
  } = useDetectMaps();

  useEffect(() => {
    if (maps.length === 0) {
      setTileLayerError("No maps detected");
      setSelectedMapType(null);
    } else if (maps.length === 1) {
      const detectedMap = maps[0];
      switch (detectedMap.type) {
        case "google":
          setSelectedMapType("google");
          break;
        case "yandex":
          setSelectedMapType("yandex");
          break;
        case "leaflet":
        default:
          setTileLayerError(`Incorrect selected map type: ${selectedMapType}`);
          setSelectedMapType(null);
          break;
      }
    } else if (maps.length > 1) {
      setTileLayerError("Multiple maps detected");
      setSelectedMapType(null);
    } else {
      setTileLayerError("Failed to detect map type");
      setSelectedMapType(null);
    }
  }, [maps, selectedMapType]);

  const selectedMapTileLayer = useMemo((): MapTileLayer | null => {
    switch (selectedMapType) {
      case "leaflet":
        return createLeafletProvider();
      case "google":
        return createGoogleLayer("roadmap");
      case "yandex":
        return createYandexLayer("map");
      default:
        setTileLayerError(`Incorrect selected map type: ${selectedMapType}`);
        return null;
    }
  }, [selectedMapType]);

  return {
    TileLayer: selectedMapTileLayer,
    error: mapDetectionError
      ? "Error while detecting map type: " + errorToString(mapDetectionError)
      : tileLayerError
        ? "Error while creating map provider: " + tileLayerError
        : null,
    isLoading,
    refreshMaps: refreshMapsDetection,
  };
};

const loadGoogleLayerFromLeafletWrapper =
  async (): Promise<GoogleLayerComponent | null> => {
    try {
      // Try to dynamically load the ReactLeafletGoogleLayer if available
      const module = await import("react-leaflet-google-layer");
      return module.default;
    } catch (e) {
      console.error("react-leaflet-google-layer is not available:", e);
      return null;
    }
  };

const createGoogleLayer = (mapType: string): MapTileLayer | null => {
  let GoogleLayer: GoogleLayerComponent | null = null;

  void loadGoogleLayerFromLeafletWrapper().then((x) => {
    GoogleLayer = x;
  });

  if (!GoogleLayer) return null;
  GoogleLayer = GoogleLayer as GoogleLayerComponent;

  return (
    <GoogleLayer
      apiKey={process.env.VITE_GOOGLE_MAPS_API_KEY || ""}
      // @ts-expect-error: type is not assignable to the expected type
      type={mapType}
    />
  );
};

// Helper functions to create layers
const createLeafletProvider = (): MapTileLayer | null => {
  // return <MapProvider></MapProvider>;
  return null;
};

const createYandexLayer = (mapType: string): MapTileLayer | null => {
  const extendedL = L as unknown as ExtendedL;
  if (typeof extendedL.yandex !== "function") return null;

  const YandexLayer = createLayerComponent<L.TileLayer, YandexLayerProps>(
    // create
    (props: YandexLayerProps, ctx) => {
      const extendedL = L as unknown as ExtendedL;
      const instance = extendedL.yandex(props.type || "map", props);
      return { instance, context: ctx };
    },
    // update
    (instance, props, prevProps) => {
      if (
        "opacity" in props &&
        "opacity" in prevProps &&
        props.opacity !== prevProps.opacity &&
        typeof instance.setOpacity === "function"
      ) {
        instance.setOpacity(props.opacity as number);
      }
    },
  );

  return <YandexLayer type={mapType} />;
};
