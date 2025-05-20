import { StateCreator } from "zustand/vanilla";

export interface UiSlice {
  overlayVisible: boolean;
  selectedStationId: string | null;
  selectedRouteId: string | null;
  maxTransfers: 0 | 1 | 2 | 3;
  circleRadiusKm: 1 | 3 | 5;
  setOverlayVisible: (v: boolean) => void;
  setSelectedStationId: (id: string | null) => void;
  setSelectedRouteId: (id: string | null) => void;
  setMaxTransfers: (n: 0 | 1 | 2 | 3) => void;
  setCircleRadiusKm: (r: 1 | 3 | 5) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  overlayVisible: true,
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
