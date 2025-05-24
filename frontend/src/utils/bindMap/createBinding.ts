import { Map as YandexMap } from "yandex-maps";
import { DetectedMap } from "../detectMaps/detectMaps";

export type Binding = {
  bind: (onError: (error: Error | null) => void) => void;
  unbind: (onError: (error: Error | null) => void) => void;
};

export const createBinding = (
  m: DetectedMap,
  targetMap: L.Map,
): Binding | Error => {
  switch (m.type) {
    case "google":
      return {
        ...createGoogleBinding(m.instance, targetMap),
      };
    case "yandex":
      return {
        ...createYandexBinding(m.instance, targetMap),
      };
    case "leaflet":
      return {
        ...createLeafletBinding(m.instance, targetMap),
      };
    default:
      return new Error("Unknown map type detected");
  }
};

const createYandexBinding = (ymap: YandexMap, lmap: L.Map): Binding => {
  const sync = (onError: (error: Error | null) => void): void => {
    try {
      const c = ymap.getCenter();
      lmap.setView([c[0], c[1]], ymap.getZoom(), { animate: true });
      onError(null);
    } catch (error) {
      onError(new Error("Failed to sync Yandex map to Leaflet"));
    }
  };

  return {
    bind: (onError): void => {
      try {
        sync(onError); // once at start
        ymap.events.add(["actionend", "boundschange"], () => sync(onError));
        onError(null);
      } catch (error) {
        onError(new Error("Failed to bind Yandex map to Leaflet"));
      }
    },

    unbind: (onError): void => {
      try {
        ymap.events.remove(["actionend", "boundschange"], () => sync(onError));
        onError(null);
      } catch (error) {
        onError(new Error("Failed to unbind Yandex map from Leaflet"));
      }
    },
  };
};

const createGoogleBinding = (gmap: google.maps.Map, lmap: L.Map): Binding => {
  let listener: google.maps.MapsEventListener | null = null;
  let isBound = false;

  const sync = (onError: (error: Error | null) => void): void => {
    try {
      const c = gmap.getCenter();
      if (!c) throw new Error("Google map has no center");
      lmap.setView([c.lat(), c.lng()], gmap.getZoom(), { animate: true });
      onError(null);
    } catch (e) {
      onError(new Error("Failed to sync Google -> Leaflet"));
    }
  };

  return {
    bind(onError): void {
      try {
        if (isBound) return;
        sync(onError);
        listener = gmap.addListener("idle", () => sync(onError));
        isBound = true;
        onError(null);
      } catch {
        onError(new Error("Failed to bind Google -> Leaflet"));
      }
    },
    unbind(onError): void {
      try {
        if (!isBound) return;
        if (listener) {
          google.maps.event.removeListener(listener);
          listener = null;
        }
        isBound = false;
        onError(null);
      } catch {
        onError(new Error("Failed to unbind Google -> Leaflet"));
      }
    },
  };
};

const createLeafletBinding = (sourceMap: L.Map, targetMap: L.Map): Binding => {
  let isBound = false;

  const sync = (onError: (error: Error | null) => void): void => {
    try {
      const center = sourceMap.getCenter();
      const zoom = sourceMap.getZoom();
      targetMap.setView([center.lat, center.lng], zoom, { animate: true });
      onError(null);
    } catch {
      onError(new Error("Failed to sync Leaflet -> Leaflet"));
    }
  };

  return {
    bind(onError): void {
      try {
        if (isBound) return;
        sync(onError);
        sourceMap.on("moveend zoomend", () => sync(onError));
        isBound = true;
        onError(null);
      } catch {
        onError(new Error("Failed to bind Leaflet -> Leaflet"));
      }
    },

    unbind(onError): void {
      try {
        if (!isBound) return;
        sourceMap.off("moveend zoomend", () => sync(onError));
        isBound = false;
        onError(null);
      } catch {
        onError(new Error("Failed to unbind Leaflet -> Leaflet"));
      }
    },
  };
};
