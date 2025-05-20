import "leaflet-plugins/layer/tile/Yandex";
import { createLayerComponent } from "@react-leaflet/core";
import L from "leaflet";
import { JSX } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

type LY = typeof L & {
  yandex: (type: string, options?: any) => L.Layer;
};

const LY = L as LY;

export const YandexLayer = (): JSX.Element => {
  const YandexLayer = createLayerComponent(
    (props: { type?: string; [k: string]: any }, ctx) => {
      const instance = LY.yandex(props.type ?? "map", props); // 'map' | 'satellite' | ...
      return { instance, context: ctx };
    },
    // update (optional)
    (instance, props, prev) => {
      // @ts-expect-error: props.opacity is not existing
      if (props.opacity !== prev.opacity) instance.setOpacity(props.opacity);
    },
  );

  return <YandexLayer />;
};
