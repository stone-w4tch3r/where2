import React, { createContext, useContext, useRef } from "react";
import { create, StoreApi, useStore as useZustandStore } from "zustand";

// Define interfaces for the slices (empty for now)
interface UiSlice {}
interface DataSlice {}
interface MapSlice {}

// Define the store state
export interface StoreState extends UiSlice, DataSlice, MapSlice {}

// Define actions (empty for now)
export interface StoreActions {
  // Example action structure - will be filled in later sprints
  // setOverlayVisible: (visible: boolean) => void;
}

// Define the combined store type
type AppStore = StoreState & StoreActions;

// Type for the store API
type AppStoreApi = StoreApi<AppStore>;

// Create the store creator function
const createStore = () =>
  create<AppStore>((set) => ({
    // Initial state for UiSlice (empty)
    // ...
    // Initial state for DataSlice (empty)
    // ...
    // Initial state for MapSlice (empty)
    // ...
    // Actions (empty)
    // ...
  }));

// Create a context for the store
const StoreContext = createContext<AppStoreApi | undefined>(undefined);

// Provider component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storeRef = useRef<AppStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createStore();
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook to use the store
export function useStore<T>(selector: (state: AppStore) => T): T {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return useZustandStore(store, selector);
}

// Hook to get the entire store API (less common)
export const useStoreApi = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStoreApi must be used within a StoreProvider");
  }
  return store;
};
