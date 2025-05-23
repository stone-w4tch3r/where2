// ExternalMapContainer.tsx
import { LeafletContext, createLeafletContext } from "@react-leaflet/core";
import { Map as LeafletMap, MapOptions } from "leaflet";
import React, { JSX, useEffect, useState } from "react";

export interface ThirdPartyMapConnectorProps extends MapOptions {
  children: React.ReactNode;
}

export const ThirdPartyMapConnector = ({
  children,
  ...opts
}: ThirdPartyMapConnectorProps): JSX.Element | null => {
  const [ctx, setCtx] = useState<ReturnType<typeof createLeafletContext>>();

  // const { TileLayer, error, isLoading, refreshMaps } = useCreateMapProvider();

  /* create & destroy the map exactly once */
  useEffect((): (() => void) => {
    const map = new LeafletMap(thirdPartyMap, { ...opts });
    setCtx(createLeafletContext(map));
    return () => map.remove();
  }, [thirdPartyMap, opts]);

  /* until Leaflet is ready, render nothing */
  if (!ctx) return null;

  return <LeafletContext value={ctx}>{children}</LeafletContext>;
};
