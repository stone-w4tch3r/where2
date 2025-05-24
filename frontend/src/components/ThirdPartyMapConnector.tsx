import { LeafletContext, createLeafletContext } from "@react-leaflet/core";
import { Map as LeafletMap, MapOptions } from "leaflet";
import React, { JSX, useLayoutEffect, useRef, useState } from "react";
import L from "leaflet";

export interface ThirdPartyMapConnectorProps extends MapOptions {
  children: React.ReactNode;
}

/**
 * This component is used to connect a third-party map to the React Leaflet context.
 * It binds React Leaflet map to track map state and bounds.
 * New React Leaflet map is created as a transparent control-less overlay on top of the third-party map.
 */
export const ThirdPartyMapConnector = ({
  children,
  ...opts
}: ThirdPartyMapConnectorProps): JSX.Element | null => {
  const [ctx, setCtx] = useState<ReturnType<typeof createLeafletContext>>();

  // TODO

  return (
    <LeafletContext.Provider value={ctx}>
      <OverlayLeafletMap />
      {children}
    </LeafletContext.Provider>
  );
};

// TODO rewrite to hook
export const OverlayLeafletMap = (): JSX.Element | null => {
  const mapRef = useRef<L.Map | null>(null);
  const overlayElRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    /** 1. Find the original Leaflet container. */
    const original =
      document.querySelector<HTMLDivElement>(".leaflet-container");
    if (!original) {
      console.warn("[OverlayLeafletMap] No .leaflet-container found.");
      return;
    }

    /** 2. Create an absolutely-positioned overlay. */
    const overlay = document.createElement("div");
    overlay.className = "overlay-map"; // optional hook for your CSS
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0", // top:0 right:0 bottom:0 left:0
      zIndex: "999", // above the base map
      pointerEvents: "none", // let underlying map keep interaction
    });

    // ensure the parent establishes the positioning context
    const parent = original.parentElement!;
    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }
    parent.appendChild(overlay);
    overlayElRef.current = overlay;

    /** 3. Initialize the map. */
    const map = L.map(overlay, {
      attributionControl: false,
      zoomControl: false,
      dragging: false, // keep overlay passive – optional
    });
    mapRef.current = map;

    // 4. (OPTIONAL) Sync view with the base map if you have its instance.
    // const baseMap = ...;
    // baseMap.on("move", () => map.setView(baseMap.getCenter(), baseMap.getZoom()));

    /** 5. Cleanup on unmount *or* Strict-Mode re-invocation. */
    return (): void => {
      map.remove();
      overlay.remove();
    };
  }, []); // run exactly once per *real* mount

  // This component does not render anything itself.
  return null;
};
