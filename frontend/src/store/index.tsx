import { create } from "zustand";
import { UiSlice, createUiSlice } from "./uiSlice";
import { DataSlice, createDataSlice } from "./dataSlice";
import { MapSlice, createMapSlice } from "./mapSlice";

export type AppState = UiSlice & DataSlice & MapSlice;

export const useStore = create<AppState>()((...a) => ({
  ...createUiSlice(...a),
  ...createDataSlice(...a),
  ...createMapSlice(...a),
}));

export const useSelectedStationId = (): string | null =>
  useStore((state) => state.selectedStationId);

export type StoreActions = Record<string, never>;
