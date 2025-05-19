import React, { createContext, useContext, useRef } from "react";
import { create, useStore as useZustandStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
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
export interface StoreActions {
  // To be defined in later sprints
  // placeholderAction?: () => void;
}

// Define the combined store type for context-based store, if ever fully re-enabled
type AppStore = AppState & StoreActions;

// Type for the store API for context-based store
type AppStoreApi = StoreApi<AppStore>;

// Create the store creator function FOR THE CONTEXT PROVIDER
const createFullStore = (): AppStoreApi =>
  // Renamed to avoid confusion if other createStore exists
  create<AppStore>((set, get, api) => ({
    // Initial state from slices needs to be spread here if this store is to be fully functional
    // For now, this demonstrates the structure for StoreProvider
    ...createUiSlice(set, get, api as any), // Pass set, get, api if slices expect them
    ...createDataSlice(set, get, api as any),
    ...createMapSlice(set, get, api as any),
    // Any additional actions for StoreActions would go here
  }));

const StoreContext = createContext<AppStoreApi | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storeRef = useRef<AppStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createFullStore();
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

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
