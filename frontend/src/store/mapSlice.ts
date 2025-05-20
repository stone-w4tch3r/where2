import { StateCreator } from "zustand/vanilla";

export interface MapSlice {
  mapProvider: string;
  mapCenter: [number, number];
  mapZoom: number;
  highlightedElements: any;
  // actions
  setMapProvider: (providerKey: string) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  setHighlightedElements: (elements: any) => void;
}

export const createMapSlice: StateCreator<MapSlice, [], [], MapSlice> = (
  set,
) => ({
  mapProvider: "openstreetmap",
  mapCenter: [56.8389, 60.6057], // Default to Yekaterinburg
  mapZoom: 10,
  highlightedElements: null,
  setMapProvider: (providerKey) => set(() => ({ mapProvider: providerKey })),
  setMapCenter: (center) => set(() => ({ mapCenter: center })),
  setMapZoom: (zoom) => set(() => ({ mapZoom: zoom })),
  setHighlightedElements: (elements) =>
    set(() => ({ highlightedElements: elements })),
});
