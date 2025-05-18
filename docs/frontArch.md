# Front‑End Technical Specification (Medium–Low Level)

## 1  Scope

This document defines **all code‑level entities, responsibilities, contracts, and data flows** for the front‑end of the *where2* map overlay.  It eliminates ambiguity so that an implementation agent can convert the spec to working code without creative interpretation.

---

## 2  Technology Stack (fixed)

| Concern                 | Library / Tool                      |
|-------------------------|-------------------------------------|
| Language                | TypeScript                          |
| UI runtime              | React 18                            |
| Build                   | Vite                                |
| Design system           | Ant Design                          |
| Map engine              | Leaflet                             |
| State                   | Zustand                             |
| Remote cache / fetching | React Query (@tanstack/react‑query) |
| Forms & validation      | React Hook Form ^7 + Zod ^3         |
| Geometry utils          | Turf.js ^7                          |
| Lint/format             | ESLint (airbnb‑ts) + Prettier       |
| Tests                   | Vitest + React Testing Library      |
| Static type checks      | tsc (strict: true)                  |

---

## 3  Project Layout

```
/src
  main.tsx                // React root, QueryClient, Store provider, i18n
  App.tsx                 // <Router> with a single route => <MapPage/>
  /pages
    MapPage.tsx
  /components             // Presentational & container components
    MapContainer/
      index.tsx
    SideMenu/
      index.tsx
      OverlayToggle.tsx
      RouteSelector.tsx
      TransferOptions.tsx
    StationPopup/
      index.tsx
      ScheduleView.tsx
    Overlays/
      RoutesOverlay.tsx
      CoverageCircle.tsx
      ReachabilityHighlight.tsx
  /hooks                  // Data & map behaviour hooks
    useMapProvider.ts
    useStations.ts
    useRoutes.ts
    useSchedule.ts
    useReachableStations.ts
    useCircleOverlay.ts
  /store                  // Zustand slices & factory
    uiSlice.ts
    dataSlice.ts
    mapSlice.ts
    index.ts              // createStore => useStore hook
  /api                    // Typed React‑Query wrappers
    client.ts             // axios instance
    stations.ts
    routes.ts
    reachability.ts
  /lib
    geo.ts                // turf helpers
    mapProviderFactory.ts // provider abstraction
  /types                  // Pure TS types shared across layers
    station.ts
    route.ts
    reachability.ts
  /config
    env.ts                // runtime‑safe env access via import.meta.env
  /tests                  // *.test.ts(x)
```

**FOLLOW THIS STRUCTURE**

---

## 4  Type & Schema Definitions

Each DTO from the backend has an **immutable** front‑end twin in `/types` and a **Zod schema** for runtime validation:

```ts
// /types/station.ts
export interface StationDto {
  id: string;
  fullName: string;
  transportMode: "train" | "suburban"; // restricted client‑side
  latitude: number;
  longitude: number;
  country: string | null;
  region: string | null;
}

export const StationSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  transportMode: z.enum(["train", "suburban"]),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().nullable(),
  region: z.string().nullable(),
});
```

*Generate the remaining schemas analogously.* **All external data *must* pass `schema.parse()` in the React Query `select` phase.**

---

## 5  API Client Layer

### 5.1 axios instance (`/api/client.ts`)

```ts
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});
```

*No interceptors besides the default JSON error unwrap.*

### 5.2 React Query hooks (pattern)

```ts
export const useStationsQuery = (q: StationQuery) =>
  useQuery({
    queryKey: ["stations", q],
    queryFn: () => axiosClient.get<StationDto[]>("/stations", { params: q }),
    select: (res) => StationArraySchema.parse(res.data),
    staleTime: 10 * 60 * 1000,   // 10 min
    cacheTime: 30 * 60 * 1000,   // 30 min
  });
```

*Implement `useRoutesQuery`, `useReachabilityQuery`, … with the same template.* **No mutation hooks are required.**

---

## 6  State Management (Zustand)

Create the store with three **slices** – UI, Data, Map – composed via *slice middleware pattern*:

```ts
export interface UiSlice {
  overlayVisible: boolean;
  selectedStationId: string | null;
  selectedRouteId: string | null;
  maxTransfers: 0 | 1 | 2 | 3;
  circleRadiusKm: 1 | 3 | 5;
  // actions
  setOverlayVisible(v: boolean): void;
  setSelectedStation(id: string | null): void;
  setSelectedRoute(id: string | null): void;
  setMaxTransfers(n: 0 | 1 | 2 | 3): void;
  setCircleRadiusKm(r: 1 | 3 | 5): void;
}
```

DataSlice mirrors the server entities and is **readonly**; it is hydrated exclusively inside React‑Query `onSuccess` callbacks.  MapSlice stores transient leaflet state (provider key, center, zoom, highlighted layers).  **No cross‑slice mutations are allowed.**

---

## 7  Custom React Hooks

| Hook                                            | Responsibility                                              | Dependencies                    | Return value     |
|-------------------------------------------------|-------------------------------------------------------------|---------------------------------|------------------|
| `useMapProvider()`                              | Initialise leaflet map with provider plugin; switch tileset | `mapSlice.mapProvider`          | `{ map: L.Map }` |
| `useStations()`                                 | Subscribe to stations query & store results in `dataSlice`  | bounding box (derived from map) | `StationDto[]`   |
| `useRoutes(stationId?)`                         | Fetch routes; optional filter by station                    | `stationId`                     | `RouteDto[]`     |
| `useSchedule(stationId)`                        | *Placeholder for future*                                    | `stationId`                     | schedule DTO     |
| `useReachableStations(stationId, maxTransfers)` | Fetch reachability list & push to store                     | `stationId`, `maxTransfers`     | `StationDto[]`   |
| `useCircleOverlay(center, radius)`              | Draw / update coverage circle on map                        | Leaflet refs                    | void             |

All hooks must **never** accept or return undefined fields; they must early‑return deterministic fallbacks instead.

---

## 8  Component Responsibilities (selected)

| Component               | Responsibility                                                                    | Consumes                               | Emits                                |
|-------------------------|-----------------------------------------------------------------------------------|----------------------------------------|--------------------------------------|
| `MapPage`               | Page layout; binds <SideMenu> + <MapContainer>; handles overlay toggle            | store selectors                        | none                                 |
| `SideMenu`              | Vertical drawer; hosts route selector, transfer options, coverage radius selector | store (UiSlice)                        | dispatch slice actions               |
| `MapContainer`          | Owns Leaflet instance; registers overlays; opens popups                           | hooks (`useMapProvider`, etc.)         | `onStationClick(stationId)` -> slice |
| `StationPopup`          | Shows station title + schedule list; deep‑links to Yandex Rasp                    | `useSchedule`                          | none                                 |
| `RoutesOverlay`         | Polyline overlay of current route; optional station markers                       | `useRoutes`, store.highlightedElements | none                                 |
| `CoverageCircle`        | Geographic radius circle                                                          | `useCircleOverlay`                     | none                                 |
| `ReachabilityHighlight` | Marker cluster for reachable stations                                             | `useReachableStations`                 | none                                 |

**Every component must be pure (no internal state) except for local‑UI concerns (e.g., AntD `open` booleans).**

---

## 9  Data Flows

### 9.1 User clicks a station marker

1. `MapContainer` receives click → `setSelectedStation(id)`.
2. *React Query cache check* for `/stations/{id}`; if miss, fetch.
3. `useRoutes(id)` pre‑fetches `/routes/by-station/{id}`.
4. Popup opens (`StationPopup`).  SideMenu switches to *station* mode.

### 9.2 Highlight reachable stations

1. User sets *Max Transfers* in `TransferOptions` → `setMaxTransfers(n)`.
2. `useReachableStations(selectedStationId, n)` issues `/reachability`.
3. Success handler pipes list into `dataSlice.reachableStations`.
4. `ReachabilityHighlight` observes slice, renders markers.

### 9.3 Toggle coverage circle

1. Menu radius selector → `setCircleRadiusKm(r)`.
2. `CoverageCircle` hook updates Leaflet circle (`L.Circle#setRadius`).

### 9.4 Switch map provider (Google ↔ Yandex …)

1. Menu provider dropdown → `mapSlice.setMapProvider(p)`.
2. `useMapProvider` disposes current tile layer, instantiates provider plugin via `mapProviderFactory.ts`.

---

## 10  Error & Loading Handling

*All React Query hooks* expose `isLoading`, `isError`, and `error` that must be surfaced via AntD `Spin` and `Alert` components **at the nearest visual boundary** (SideMenu panel or Popup body).  Map overlays should silently ignore data while loading.

---

## 11  Performance Constraints

* **Min FPS 30** on commodity laptops.
* Use **marker clustering** when marker count > 200.
* React Query cache & window focus refetch disabled (`refetchOnWindowFocus: false`).
* Avoid React re‑renders by memoising selectors with `shallow` compare.

---

## 12  Environmental Configuration

| Key                 | Description                     | Example                          |
|---------------------|---------------------------------|----------------------------------|
| `VITE_API_URL`      | Absolute base URL of NestJS API | `https://where2‑api.example.com` |
| `VITE_MAP_PROVIDER` | Default map provider key        | `openstreetmap`                  |

*Read via `/config/env.ts`:*
`export const env = z.object({ VITE_API_URL: z.string().url(), VITE_MAP_PROVIDER: z.string() }).parse(import.meta.env);`

---

## 13  Testing Requirements

* **Unit**: hooks & store slices (100 % branch coverage).
* **Integration**: component render with mocked API (msw) for MapPage happy paths.
* **E2E**: Cypress (separate repo, out of scope).

---

## 14  Coding Standards

* File naming: *PascalCase* for components, *camelCase* for hooks, *kebab‑case* for files.
* No default exports except React components.
* Paths resolved via `@/` alias to `/src` (configured in `tsconfig.json`).
* ESLint errors are **build failures**.

---

## 15  Non‑Functional

* **Accessibility**: All interactive elements get `aria‑label` and keyboard focus control.
* **I18n**: Strings passed through `i18next` (English only provided, but ready for RU).

---

## 16  Out‑of‑Scope Items

* Real‑time timetables
* Offline mode
* Progressive Web App features (service workers)

This specification is **frozen**.  Any deviation requires explicit change‑request approval.
