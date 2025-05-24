import { useDetectMaps } from "@/utils/detectMaps/useDetectMaps";
import { bindMap } from "@/utils/bindMap/useBindMap";
import { LeafletContext, createLeafletContext } from "@react-leaflet/core";
import { Map as LeafletMap, MapOptions } from "leaflet";
import React, {
  JSX,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AbsolutePositionedItem } from "./AbsolutePositionedItem";
import { Skeleton, Spin, Typography } from "antd";
import { DetectedMap } from "@/utils/detectMaps/detectMaps";
import L from "leaflet";

export interface ThirdPartyMapConnectorProps extends MapOptions {
  children: React.ReactNode;
}

export const ThirdPartyMapConnector = ({
  children,
  ...opts
}: ThirdPartyMapConnectorProps): JSX.Element | null => {
  const [ctx, setCtx] = useState<ReturnType<typeof createLeafletContext>>();
  const [leafletMap, setLeafletMap] = useState<LeafletMap | null>(null);
  const [mapElement, setMapElement] = useState<HTMLElement | null>(null);
  const [bindingError, setBindingError] = useState<string | null>(null);
  const [mapDetectionError, setMapDetectionError] = useState<string | null>(
    null,
  );

  // const {
  //   maps: detectedMaps,
  //   isLoading: isLoadingMaps,
  //   error: detectionErrorRaw,
  // } = useDetectMaps();

  // const filteredMap = useMapFilter({
  //   maps: detectedMaps,
  //   onError: (filterError) =>
  //     setMapDetectionError(filterError?.message || null),
  // });

  // useEffect(() => {
  //   console.log("setting map element");
  //   setMapElement(filteredMap.element);
  // }, [filteredMap]);

  // const {
  //   bindMap,
  //   unbindMap,
  //   error: mapBindingHookError,
  // } = useBindMap(filteredMap, leafletMap);

  // useEffect(() => {
  //   if (detectionErrorRaw) {
  //     setMapDetectionError(
  //       `Map detection failed: ${detectionErrorRaw.message}`,
  //     );
  //   }
  // }, [detectionErrorRaw]);

  // useEffect(() => {
  //   if (filteredMap) {
  //     setMapElement(filteredMap.element);
  //     setMapDetectionError(null);
  //   } else if (!isLoadingMaps && detectedMaps.length === 0) {
  //     setMapDetectionError("No maps detected on the page.");
  //   } else if (!isLoadingMaps && detectedMaps.length > 1) {
  //     setMapDetectionError(
  //       "Multiple maps detected on the page. Please ensure only one map is present.",
  //     );
  //   }
  // }, [filteredMap, isLoadingMaps, detectedMaps]);

  // useEffect(() => {
  //   if (mapBindingHookError) {
  //     setBindingError(`Map binding failed: ${mapBindingHookError.message}`);
  //   }
  // }, [mapBindingHookError]);

  // useEffect((): (() => void) => {
  //   if (mapElement && !leafletMap && !mapDetectionError) {
  //     const lMap = new LeafletMap(mapElement, { ...opts });
  //     setCtx(createLeafletContext(lMap));
  //     setLeafletMap(lMap);
  //     return (): void => {
  //       lMap.remove();
  //       setLeafletMap(null);
  //       setCtx(undefined);
  //     };
  //   }
  //   return (): void => {};
  // }, [mapElement, opts, mapDetectionError, leafletMap]);

  // useEffect((): (() => void) => {
  //   if (leafletMap && filteredMap && !bindingError && !mapDetectionError) {
  //     bindMap();
  //     return (): void => {
  //       unbindMap();
  //     };
  //   }
  //   return (): void => {};
  // }, [
  //   leafletMap,
  //   filteredMap,
  //   bindMap,
  //   unbindMap,
  //   bindingError,
  //   mapDetectionError,
  // ]);

  // if (isLoadingMaps) {
  //   return (
  //     <AbsolutePositionedItem position="center">
  //       <Spin tip="Detecting maps..." size="large">
  //         <Skeleton.Node active />
  //       </Spin>
  //     </AbsolutePositionedItem>
  //   );
  // }

  // if (mapDetectionError) {

  return (
    <div>
      hello
      <OverlayLeafletMap />
    </div>
  );

  // return (
  //   <LeafletContext.Provider value={ctx}>{children}</LeafletContext.Provider>
  // );
};

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
