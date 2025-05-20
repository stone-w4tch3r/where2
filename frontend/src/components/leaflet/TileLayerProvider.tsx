import React from "react";
import { TileLayer, LayersControl } from "react-leaflet";
import { createLayerComponent } from "@react-leaflet/core";
import L from "leaflet";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import "leaflet-plugins/layer/tile/Yandex";

// Define interface for Yandex layer props
interface YandexLayerProps extends Omit<L.TileLayerOptions, "type"> {
  type?: string;
}

// Define the Yandex function that's added to Leaflet
interface ExtendedL {
  yandex: (type: string, options?: YandexLayerProps) => L.TileLayer;
}

// Define YandexLayer as a React-Leaflet component
const YandexLayer = createLayerComponent<L.TileLayer, YandexLayerProps>(
  // create
  (props: YandexLayerProps, ctx) => {
    // Check if L.yandex exists
    const extendedL = L as unknown as ExtendedL;
    if (typeof extendedL.yandex !== "function") {
      console.error(
        "L.yandex is not available. Make sure leaflet-plugins is loaded.",
      );
      // Create a dummy instance for safety
      const instance = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      );
      return { instance, context: ctx };
    }

    // Use the yandex method from the extended L
    const instance = extendedL.yandex(props.type || "map", props);
    return { instance, context: ctx };
  },
  // update
  (instance, props, prevProps) => {
    // Use explicit type checking for opacity property
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

// Create a type for our dynamic Google layer component
type GoogleLayerComponent = typeof ReactLeafletGoogleLayer;

// Create an interface for the window with the ReactLeafletGoogleLayer property
interface WindowWithGoogleLayer extends Window {
  ReactLeafletGoogleLayer?: GoogleLayerComponent;
}

// Check if we have the Google Maps Layer component available
const hasGoogleLayer =
  typeof window !== "undefined" &&
  typeof (window as WindowWithGoogleLayer).ReactLeafletGoogleLayer !==
    "undefined";

// Try importing Google Layer dynamically to avoid runtime errors
const loadGoogleLayer = async (): Promise<GoogleLayerComponent | null> => {
  try {
    // Try to dynamically load the ReactLeafletGoogleLayer if available
    const module = await import("react-leaflet-google-layer");
    return module.default;
  } catch (e) {
    console.warn("react-leaflet-google-layer is not available:", e);
    return null;
  }
};

// Rendered based on availability at runtime
const TileLayerProvider: React.FC = () => {
  const [GoogleLayer, setGoogleLayer] =
    React.useState<GoogleLayerComponent | null>(null);

  React.useEffect(() => {
    if (!hasGoogleLayer) {
      loadGoogleLayer().then((component) => {
        if (component) {
          setGoogleLayer(() => component);
        }
      });
    } else if (window && "ReactLeafletGoogleLayer" in window) {
      // Type assertion after runtime check
      const win = window as WindowWithGoogleLayer;
      if (win.ReactLeafletGoogleLayer) {
        setGoogleLayer(
          () => win.ReactLeafletGoogleLayer as GoogleLayerComponent,
        );
      }
    }
  }, []);

  // Check if Yandex Layer is available
  const hasYandexLayer =
    typeof (L as unknown as ExtendedL).yandex === "function";

  return (
    <LayersControl position="topright">
      {/* Default OpenStreetMap layer */}
      <LayersControl.BaseLayer checked name="OpenStreetMap">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </LayersControl.BaseLayer>

      {/* Google Maps layer - only if available */}
      {GoogleLayer && (
        <>
          <LayersControl.BaseLayer name="Google Maps - Road">
            <GoogleLayer
              apiKey={process.env.VITE_GOOGLE_MAPS_API_KEY || ""}
              type="roadmap"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Maps - Satellite">
            <GoogleLayer
              apiKey={process.env.VITE_GOOGLE_MAPS_API_KEY || ""}
              type="satellite"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Maps - Hybrid">
            <GoogleLayer
              apiKey={process.env.VITE_GOOGLE_MAPS_API_KEY || ""}
              type="hybrid"
            />
          </LayersControl.BaseLayer>
        </>
      )}

      {/* Yandex Maps layer - only if available */}
      {hasYandexLayer && (
        <>
          <LayersControl.BaseLayer name="Yandex Maps">
            <YandexLayer type="map" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Yandex Maps - Satellite">
            <YandexLayer type="satellite" />
          </LayersControl.BaseLayer>
        </>
      )}
    </LayersControl>
  );
};

export default TileLayerProvider;
