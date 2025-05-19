import { StateCreator } from "zustand/vanilla";

export interface UiSlice {
  overlayVisible: boolean;
  selectedStationId: string | null;
  selectedRouteId: string | null;
  maxTransfers: 0 | 1 | 2 | 3;
  circleRadiusKm: 1 | 3 | 5;
  // actions
  setOverlayVisible: (v: boolean) => void;
  setSelectedStationId: (id: string | null) => void; // Corrected name based on convention
  setSelectedRouteId: (id: string | null) => void; // Corrected name based on convention
  setMaxTransfers: (n: 0 | 1 | 2 | 3) => void;
  setCircleRadiusKm: (r: 1 | 3 | 5) => void;
}

export const createUiSlice: StateCreator<
  UiSlice,
  [], // No middleware for individual slice creation if using a combined setup
  [],
  UiSlice
> = (set) => ({
  overlayVisible: true, // Default to true or as per preference
  selectedStationId: null,
  selectedRouteId: null,
  maxTransfers: 0,
  circleRadiusKm: 1,
  setOverlayVisible: (v) => set(() => ({ overlayVisible: v })),
  setSelectedStationId: (id) => set(() => ({ selectedStationId: id })),
  setSelectedRouteId: (id) => set(() => ({ selectedRouteId: id })),
  setMaxTransfers: (n) => set(() => ({ maxTransfers: n })),
  setCircleRadiusKm: (r) => set(() => ({ circleRadiusKm: r })),
});
