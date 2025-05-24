import {
  JSX,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Map as LeafletMap, MapOptions } from "leaflet";
import { LeafletContext, createLeafletContext } from "@react-leaflet/core";

import { useDetectMap } from "../utils/detectMaps/useDetectMap";
import { createBinding, type Binding } from "../utils/bindMap/createBinding";

export const OVERLAY_CLASS_NAME = "where2-map-overlay";

/**
 * Mounts an *transparent* Leaflet map right on top of whatever map
 * `useDetectMap()` finds in the document (Google, Yandex or Leaflet).
 *
 * Once mounted, it provides the Leaflet context so descendant React‑Leaflet
 * components can render into that overlay map.
 */
export function ThirdPartyMapConnection({
  children,
  ...mapOpts
}: PropsWithChildren & MapOptions): JSX.Element | null {
  /* ---------------------------------------------------------------------
   * 1. Detect the host map (the one already on the page)
   * -------------------------------------------------------------------*/
  const { map: detectedMap, isLoading, error } = useDetectMap();

  /* ---------------------------------------------------------------------
   * 2. Local refs that must survive re‑renders
   * -------------------------------------------------------------------*/
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [binding, setBinding] = useState<Binding | null>(null);
  const [ctx, setCtx] = useState<ReturnType<typeof createLeafletContext>>();

  /* ---------------------------------------------------------------------
   * 3. Create the overlay <div>, Leaflet map instance, and the binding.
   *    Runs exactly once per *real* mount (Strict‑Mode safe).
   * -------------------------------------------------------------------*/
  useLayoutEffect(() => {
    if (!detectedMap || error) return; // nothing to do yet

    /* 3.1 Locate the element to cover */
    const hostEl = detectedMap.element;

    /* 3.2 Build the overlay container if it doesn't exist yet */
    if (!overlayRef.current) {
      const overlay = document.createElement("div");
      overlay.className = OVERLAY_CLASS_NAME;
      Object.assign(overlay.style, {
        position: "absolute",
        inset: "0", // top:0 right:0 bottom:0 left:0
        pointerEvents: "none", // keep host map interactive
        zIndex: "999", // on top (customise if needed)
      });

      // Ensure the host's parent establishes a positioning context
      const parent = hostEl.parentElement ?? document.body;
      if (getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }
      parent.appendChild(overlay);
      overlayRef.current = overlay;
    }

    /* 3.3 Create the Leaflet map */
    const overlayMap = new LeafletMap(overlayRef.current, mapOpts);
    setCtx(createLeafletContext(overlayMap));

    /* 3.4 Bind the two maps */
    const bindingResult = createBinding(detectedMap, overlayMap);
    if (bindingResult instanceof Error) {
      console.error("[ThirdPartyMapConnector]", bindingResult);
    } else {
      setBinding(bindingResult);
      bindingResult.bind((bindErr) => {
        if (bindErr) console.error("[ThirdPartyMapConnector]", bindErr);
      });
    }

    return (): void => {
      binding?.unbind(() => undefined);
      setBinding(null);
      overlayMap.remove();
      overlayRef.current?.remove();
      overlayRef.current = null;
      setCtx(undefined);
    };
  }, [detectedMap, error, binding]);

  /* ---------------------------------------------------------------------
   * 4. Render messages until everything is ready
   * -------------------------------------------------------------------*/
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!ctx) {
    return <div>No context</div>;
  }

  /* ---------------------------------------------------------------------
   * 5. Provide the Leaflet context so children can render React‑Leaflet tiles,
   *    markers, etc. into the overlay map.
   * -------------------------------------------------------------------*/
  return (
    <LeafletContext.Provider value={ctx}>{children}</LeafletContext.Provider>
  );
}
