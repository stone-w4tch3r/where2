import React, { createContext, useContext, useRef } from "react";
import { create, useStore as useZustandStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import { UiSlice, createUiSlice } from "./uiSlice";
import { DataSlice, createDataSlice } from "./dataSlice";
import { MapSlice, createMapSlice } from "./mapSlice";
import { AppState, StoreActions } from ".";

// Define the combined store type for context-based store
type AppStore = AppState & StoreActions;

// Type for the store API for context-based store
type AppStoreApi = StoreApi<AppStore>;

// Create the store creator function FOR THE CONTEXT PROVIDER
const createFullStore = (): AppStoreApi =>
  create<AppStore>((set, get, api) => ({
    ...createUiSlice(set, get, api as any),
    ...createDataSlice(set, get, api as any),
    ...createMapSlice(set, get, api as any),
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

// Optional: Context-based hooks, can be moved here or kept separate if preferred
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
