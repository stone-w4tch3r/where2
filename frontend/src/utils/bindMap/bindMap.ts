import { Map as YandexMap } from "yandex-maps";
import { DetectedMap } from "../detectMaps/detectMaps";

export type Binding = {
  bind: () => void;
  unbind: () => void;
};

export const makeBinding = (
  m: DetectedMap,
  targetMap: L.Map,
  onError: (error: Error | null) => void,
): Binding => {
  const dummyBinding: Binding = {
    bind: () => {},
    unbind: () => {},
  };

  switch (m.type) {
    case "google":
      return {
        ...createGoogleBinding(m.instance, targetMap, onError),
      };
    case "yandex":
      return {
        ...createYandexBinding(m.instance, targetMap, onError),
      };
    case "leaflet":
      return {
        ...createLeafletBinding(m.instance, targetMap, onError),
      };
    default:
      onError(new Error("Unknown map type detected"));
      return dummyBinding;
  }
};

const createYandexBinding = (
  ymap: YandexMap,
  lmap: L.Map,
  onError: (error: Error | null) => void,
): Binding => {
  const sync = (): void => {
    try {
      const c = ymap.getCenter();
      lmap.setView([c[0], c[1]], ymap.getZoom(), { animate: true });
      onError(null);
    } catch (error) {
      onError(new Error("Failed to sync Yandex map to Leaflet"));
    }
  };

  return {
    bind: (): void => {
      try {
        sync(); // once at start
        ymap.events.add(["actionend", "boundschange"], sync);
        onError(null);
      } catch (error) {
        onError(new Error("Failed to bind Yandex map to Leaflet"));
      }
    },

    unbind: (): void => {
      try {
        ymap.events.remove(["actionend", "boundschange"], sync);
        onError(null);
      } catch (error) {
        onError(new Error("Failed to unbind Yandex map from Leaflet"));
      }
    },
  };
};

const createGoogleBinding = (
  gmap: google.maps.Map,
  lmap: L.Map,
  onError: (error: Error | null) => void,
): Binding => {
  let listener: google.maps.MapsEventListener | null = null;
  let isBound = false;

  const sync = (): void => {
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
    bind(): void {
      try {
        if (isBound) return;
        sync();
        listener = gmap.addListener("idle", sync);
        isBound = true;
        onError(null);
      } catch {
        onError(new Error("Failed to bind Google -> Leaflet"));
      }
    },
    unbind(): void {
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

const createLeafletBinding = (
  sourceMap: L.Map,
  targetMap: L.Map,
  onError: (error: Error | null) => void,
): Binding => {
  let isBound = false;

  const sync = (): void => {
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
    bind(): void {
      try {
        if (isBound) return;
        sync();
        sourceMap.on("moveend zoomend", sync);
        isBound = true;
        onError(null);
      } catch {
        onError(new Error("Failed to bind Leaflet -> Leaflet"));
      }
    },

    unbind(): void {
      try {
        if (!isBound) return;
        sourceMap.off("moveend zoomend", sync);
        isBound = false;
        onError(null);
      } catch {
        onError(new Error("Failed to unbind Leaflet -> Leaflet"));
      }
    },
  };
};
