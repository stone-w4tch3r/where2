import { StateCreator } from "zustand/vanilla";

// Assuming L.LatLngTuple and L.Layer might be something like:
// type LatLngTuple = [number, number];
// interface Layer { id: string; /* ... other Leaflet layer properties */ }
// For now, using 'any' for Leaflet specific types if not readily available.
// It's better to define these more accurately if Leaflet types are installed.

export interface MapSlice {
  mapProvider: string; // key for the map provider
  mapCenter: [number, number]; // e.g., [latitude, longitude]
  mapZoom: number;
  highlightedElements: any; // Could be layer IDs, feature IDs, etc. - Using any as per spec diagram, refine later
  // actions
  setMapProvider: (providerKey: string) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  setHighlightedElements: (elements: any) => void;
}

export const createMapSlice: StateCreator<MapSlice, [], [], MapSlice> = (
  set,
) => ({
  mapProvider: "openstreetmap", // Default provider, can be from env
  mapCenter: [56.8389, 60.6057], // Default to Yekaterinburg, for example
  mapZoom: 10,
  highlightedElements: null, // Or an empty array/object depending on structure
  setMapProvider: (providerKey) => set(() => ({ mapProvider: providerKey })),
  setMapCenter: (center) => set(() => ({ mapCenter: center })),
  setMapZoom: (zoom) => set(() => ({ mapZoom: zoom })),
  setHighlightedElements: (elements) =>
    set(() => ({ highlightedElements: elements })),
});
