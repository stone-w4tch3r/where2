import { create } from "zustand";
import { UiSlice, createUiSlice } from "./uiSlice";
import { DataSlice, createDataSlice } from "./dataSlice";
import { MapSlice, createMapSlice } from "./mapSlice";

// Combine interfaces for the full store type
export type AppState = UiSlice & DataSlice & MapSlice;

// Create the store using the slice pattern - THIS IS THE PRIMARY HOOK
export const useStore = create<AppState>()((...a) => ({
  ...createUiSlice(...a),
  ...createDataSlice(...a),
  ...createMapSlice(...a),
}));

// Optional: Selectors for convenience and memoization (using shallow)
// Example selector (can be expanded based on needs)
export const useSelectedStationId = (): string | null =>
  useStore((state) => state.selectedStationId);

// As per frontArch.md: "Avoid React re‑renders by memoising selectors with shallow compare."
// This can be done on a per-component basis or by providing shallow-wrapped selectors.
// For now, a simple selector example is provided. Components can use `useStore(selector, shallow)` themselves.

// Define actions (empty for now)
export type StoreActions = Record<string, never>; // Explicitly an empty object type
// To be defined in later sprints
// placeholderAction?: () => void;

// The context-based useStore hook can remain commented or be given a different name
// if needed alongside the primary useStore. For now, it's not essential as
// StoreProvider + useZustandStore(useContext(StoreContext), selector) is the pattern.

// export function useContextStore<T>(selector: (state: AppStore) => T): T {
//   const storeApi = useContext(StoreContext);
//   if (!storeApi) {
//     throw new Error("useContextStore must be used within a StoreProvider");
//   }
//   return useZustandStore(storeApi, selector);
// }

// export const useStoreApi = () => {
//   const storeApi = useContext(StoreContext);
//   if (!storeApi) {
//     throw new Error("useStoreApi must be used within a StoreProvider");
//   }
//   return storeApi;
// };
