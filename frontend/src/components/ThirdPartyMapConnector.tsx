import { useDetectMaps } from "@/utils/detectMaps/useDetectMaps";
import { useBindMap } from "@/utils/bindMap/useBindMap";
import { LeafletContext, createLeafletContext } from "@react-leaflet/core";
import { Map as LeafletMap, MapOptions } from "leaflet";
import React, { JSX, useEffect, useState } from "react";
import { useMapFilter } from "@/utils/bindMap/useMapFilter";
import { AbsolutePositionedItem } from "./AbsolutePositionedItem";
import { Skeleton, Spin, Typography } from "antd";

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

  const {
    maps: detectedMaps,
    isLoading: isLoadingMaps,
    error: detectionErrorRaw,
  } = useDetectMaps();

  const filteredMap = useMapFilter({
    maps: detectedMaps,
    onError: (filterError) =>
      setMapDetectionError(filterError?.message || null),
  });

  const {
    bindMap,
    unbindMap,
    error: mapBindingHookError,
  } = useBindMap(filteredMap!, leafletMap);

  useEffect(() => {
    if (detectionErrorRaw) {
      setMapDetectionError(
        `Map detection failed: ${detectionErrorRaw.message}`,
      );
    }
  }, [detectionErrorRaw]);

  useEffect(() => {
    if (filteredMap) {
      setMapElement(filteredMap.element);
      setMapDetectionError(null);
    } else if (!isLoadingMaps && detectedMaps.length === 0) {
      setMapDetectionError("No maps detected on the page.");
    } else if (!isLoadingMaps && detectedMaps.length > 1) {
      setMapDetectionError(
        "Multiple maps detected on the page. Please ensure only one map is present.",
      );
    }
  }, [filteredMap, isLoadingMaps, detectedMaps]);

  useEffect(() => {
    if (mapBindingHookError) {
      setBindingError(`Map binding failed: ${mapBindingHookError.message}`);
    }
  }, [mapBindingHookError]);

  useEffect((): (() => void) => {
    if (mapElement && !leafletMap && !mapDetectionError) {
      const lMap = new LeafletMap(mapElement, { ...opts });
      setCtx(createLeafletContext(lMap));
      setLeafletMap(lMap);
      return (): void => {
        lMap.remove();
        setLeafletMap(null);
        setCtx(undefined);
      };
    }
    return (): void => {};
  }, [mapElement, opts, mapDetectionError, leafletMap]);

  useEffect((): (() => void) => {
    if (leafletMap && filteredMap && !bindingError && !mapDetectionError) {
      bindMap();
      return (): void => {
        unbindMap();
      };
    }
    return (): void => {};
  }, [
    leafletMap,
    filteredMap,
    bindMap,
    unbindMap,
    bindingError,
    mapDetectionError,
  ]);

  if (isLoadingMaps) {
    return (
      <AbsolutePositionedItem position="center">
        <Spin tip="Detecting maps..." size="large">
          <Skeleton.Node active />
        </Spin>
      </AbsolutePositionedItem>
    );
  }

  if (mapDetectionError) {
    return (
      <AbsolutePositionedItem position="center">
        <Typography.Text type="danger">
          {"Map detection failed: [" + mapDetectionError + "]"}
        </Typography.Text>
      </AbsolutePositionedItem>
    );
  }

  if (bindingError) {
    return (
      <AbsolutePositionedItem position="center">
        <Typography.Text type="danger">
          {"Map binding failed: [" + bindingError + "]"}
        </Typography.Text>
      </AbsolutePositionedItem>
    );
  }

  if (!ctx || !leafletMap) {
    return (
      <AbsolutePositionedItem position="center">
        <Spin tip="Initializing map..." size="large">
          <Skeleton.Node active />
        </Spin>
      </AbsolutePositionedItem>
    );
  }

  return (
    <LeafletContext.Provider value={ctx}>{children}</LeafletContext.Provider>
  );
};
