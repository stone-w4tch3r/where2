### Yes — your React-Leaflet overlays will keep working

Because **react-leaflet** is only a thin React wrapper around an ordinary `L.Map`, any canvas/SVG/GeoJSON layer you already draw will behave the same no matter which _base_ layer is switched on.  
All you have to do is plug Google- or Yandex-powered `L.GridLayer`s into the component tree.

Below is a minimal, production-ready recipe that stays entirely inside the React-Leaflet ecosystem (option ① from the previous message).

---

## 1 . Install what you need

```bash
# core
npm i leaflet react-leaflet

# Google basemap (wrapper around leaflet-gridlayer-googlemutant)
npm i react-leaflet-google-layer         # v4 works with React-Leaflet v3/v4  [oai_citation:0‡npm](https://www.npmjs.com/package/react-leaflet-google-layer)

# Yandex basemap (comes from the historical Leaflet-Plugins repo)
npm i leaflet-plugins

# Only if you **don’t** want a <script> tag for Google:
npm i @googlemaps/js-api-loader
```

Add Leaflet’s CSS once, e.g. in `index.css`:

```css
@import "leaflet/dist/leaflet.css";
```

---

## 2 . <MapContainer> with three switchable base layers

```tsx
// Map.tsx (TypeScript, React 18 + react-leaflet v4)
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
import { YandexLayer } from "./YandexLayer"; // section 3 below

const center: [number, number] = [55.751244, 37.618423]; // Moscow

export function Map() {
  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <LayersControl position="topright">
        {/* 1. Free OSM fallback */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OSM contributors"
          />
        </LayersControl.BaseLayer>

        {/* 2. Google (road, satellite, terrain, hybrid) */}
        <LayersControl.BaseLayer name="Google – Road">
          <ReactLeafletGoogleLayer
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            type="roadmap"
          />
        </LayersControl.BaseLayer>

        {/* 3. Yandex */}
        <LayersControl.BaseLayer name="Yandex – Map">
          <YandexLayer type="map" />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* ...your existing overlay layers/controls go here… */}
    </MapContainer>
  );
}
```

_Switch baselayers with the built-in **LayersControl**; your overlay code never notices the change._

---

## 3 . Wrapping the Yandex plugin once

`leaflet-plugins` ships plain Leaflet code (`L.Yandex`).  
React-Leaflet gives you the low-level helper `createLayerComponent` — wrap it once and reuse:

```ts
// YandexLayer.tsx
import { createLayerComponent } from "@react-leaflet/core";
import "leaflet-plugins/layer/tile/Yandex"; // adds L.yandex(...)
import L from "leaflet";

// tiny React component
export const YandexLayer = createLayerComponent(
  // create
  (props: { type?: string; [k: string]: any }, ctx) => {
    const instance = L.yandex(props.type ?? "map", props); // 'map' | 'satellite' | ...
    return { instance, context: ctx };
  },
  // update (optional)
  (instance, props, prev) => {
    if (props.opacity !== prev.opacity) instance.setOpacity(props.opacity);
  }
);
```

For the Yandex JS API itself, add once in `index.html` (or dynamically):

```html
<script
  src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=YOUR_YANDEX_KEY"
  defer
></script>
```

That’s it — `<YandexLayer/>` now behaves exactly like a normal `<TileLayer/>`.  
(The snippet follows the same pattern people use in practice [oai_citation:1‡GitHub](https://github.com/shramov/leaflet-plugins/issues/307?utm_source=chatgpt.com).)

---

## 4 . Things to watch

| Provider        | Quirks & tips                                                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google**      | • Must keep logo & attribution<br>• JS API is loaded automatically by `react-leaflet-google-layer` via `@googlemaps/js-api-loader` (or `useGoogMapsLoader={false}` if you prefer a raw `<script>`).                                                                 |
| **Yandex**      | • Plugin relies on the global `ymaps` namespace; load it **once** before the layer is mounted.<br>• On route change/unmount, call `map.removeLayer(yandexLayer)` or just let React-Leaflet handle it; recent Leaflet ≥ 1.9 fixes most “container undefined” errors. |
| **Performance** | Both baselayers add one more `<div>` over Leaflet’s canvas; on low-end mobiles you might want to throttle events like `mousemove` in your overlay.                                                                                                                  |

---

### You’re done

Every overlay you’ve already written for React-Leaflet keeps working with **zero** changes; the user just toggles between OSM, Google or Yandex backgrounds. Enjoy the extra map sources!
