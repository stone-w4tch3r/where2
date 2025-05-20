import React, { createContext, useContext, useRef } from "react";
import { create, useStore as useZustandStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import { UiSlice, createUiSlice } from "./uiSlice";
import { DataSlice, createDataSlice } from "./dataSlice";
import { MapSlice, createMapSlice } from "./mapSlice";
import { AppState, StoreActions } from ".";

type AppStore = AppState & StoreActions;

type AppStoreApi = StoreApi<AppStore>;

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
