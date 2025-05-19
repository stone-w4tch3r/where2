# Where2 Front‑End Sprint Plan

> Version: 2025‑05‑19

### Conventions

* All paths relative to project root (`where2`).
* Follow project layout defined in spec.
* Run `npm run lint` & `npm run test` after each sprint; CI must be green.

---

## Sprint 1 – Project Scaffold & Tooling Baseline

**Objective:** Create a fresh Vite + React TS workspace that mirrors the backend lint/format rules.

### Tasks

1. Run `pnpm create vite@latest where2-frontend -- --template react-ts`.
2. Copy config files from backend repo root into frontend root:

   * `.eslintrc.config.js`
   * `.prettierrc`
   * `.prettierignore`
3. Add dev dependencies:

   * `eslint`, `eslint-config-airbnb-typescript`, `eslint-plugin-react`, `prettier`, `vitest`, `@testing-library/react`, `@types/jest`.
4. Add pnpm scripts:

   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "lint": "eslint \"src/**/*.{ts,tsx}\"",
       "format": "prettier --write \"src/**/*.{ts,tsx,md}\"",
       "test": "vitest"
     }
   }
   ```

### Deliverable

* Repo folder `frontend/` with working `pnpm dev`.
* Lint passes with no errors on template code.

---

## Sprint 2 – Vite Configuration & Base Dependencies

**Objective:** Lock down tooling & project aliases required by later code.

### Tasks

1. Install core deps: `react`, `react-dom@18`, `antd`, `leaflet`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@vitejs/plugin-react`, `turf`, `@types/leaflet`.
2. Configure Vite:

   * Create `/vite.config.ts` enabling `@/` path alias to `/src`.
   * Enable `define: { 'process.env': {} }` shim.
3. Add `tsconfig.json` paths section:

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": { "@/*": ["src/*"] }
     }
   }
   ```
4. Add `src/config/env.ts` with Zod runtime parser stub.

### Deliverable

* Build succeeds; imports using `@/` path resolve.

---

## Sprint 3 – Root React Entry & Providers

**Objective:** Establish application root with React Query & global store.

### Files

| Path                    | Purpose                                             |
| ----------------------- | --------------------------------------------------- |
| `src/main.tsx`          | React root, mounts `<App/>`, wraps providers        |
| `src/store/index.ts`    | Exports `useStore` hook (empty slices for now)      |
| `src/pages/MapPage.tsx` | Placeholder div `Map coming soon`                   |

### Tasks

1. Create provider tree: `<QueryClientProvider>` with default `QueryClient`, `<StoreProvider>` exposing Zustand store via context.


### Deliverable

* Running dev server shows placeholder; no console errors.

---

## Sprint 4 – Zustand Store Skeleton

**Objective:** Implement initial slice files with type‑safe actions (no logic yet).

### Files

* `src/store/uiSlice.ts`
* `src/store/dataSlice.ts`
* `src/store/mapSlice.ts`

Each exports slice creator returning default state + actions per spec.

### Tasks

1. Define `UiSlice`, `DataSlice`, `MapSlice` interfaces exactly as spec.
2. Compose slices in `/store/index.ts` using `createStore`.
3. Add unit tests (`*.test.ts`) ensuring default state matches spec.

### Deliverable

* `vitest` passes; store can be imported by components.

---

## Sprint 5 – Domain Types & Zod Schemas

**Objective:** Provide compile‑time and run‑time safety for backend DTOs.

### Files

| Path                     | Content                                              |
| ------------------------ | ---------------------------------------------------- |
| `/types/station.ts`      | `StationDto` + `StationSchema`                       |
| `/types/route.ts`        | `RouteDto` + `RouteSchema`                           |
| `/types/reachability.ts` | `ReachabilityResultDto` + `ReachabilityResultSchema` |

### Tasks

1. Port OpenAPI definitions into corresponding TS interfaces.
2. Write Zod schemas mirroring interfaces.
3. Export `ArraySchema = z.array(Schema)` helpers.

### Deliverable

* `tsc --noEmit` passes; schemas compile.

---

## Sprint 6 – API Client Layer

**Objective:** Typed axios instance + React Query wrappers.

### Files

* `/api/client.ts`
* `/api/stations.ts`
* `/api/routes.ts`
* `/api/reachability.ts`

### Tasks

1. Create `axiosClient` per spec.
2. Implement `useStationsQuery`, `useRoutesQuery`, `useReachabilityQuery` with schema `select` parsing.
3. Unit‑test success + validation failure cases with mocked axios.

### Deliverable

* Hooks usable from components; tests mock HTTP.

---

## Sprint 7 – Map Container & Provider Hook

**Objective:** Display empty Leaflet map with provider tiles.

### Files

* `/components/MapContainer/index.tsx`
* `/hooks/useMapProvider.ts`
* `/lib/mapProviderFactory.ts`

### Tasks

1. `MapContainer` renders `<div id="map" />`, invokes `useMapProvider`.
2. `useMapProvider` initialises Leaflet map, default provider from `env.VITE_MAP_PROVIDER`.
3. Write factory for OSM provider; switchable via store later.

### Deliverable

* Local dev shows OSM map; window resize works.

---

## Sprint 8 – Stations Data Flow & Markers

**Objective:** Fetch visible stations & render map markers.

### Files

* `/hooks/useStations.ts`
* Update `MapContainer` to render markers.

### Tasks

1. Implement bounds → query param conversion inside hook.
2. On success, push stations into `dataSlice`.
3. Render `L.Marker` for each station; open basic popup with station name.
4. Set 2 seconds delay to avoid constant refetch

### Deliverable

* Panning map triggers fetch; markers appear.

---

## Sprint 9 – Side Menu UI Skeleton

**Objective:** Add overlay UI shell with basic controls (no logic).

### Files

* `/components/SideMenu/index.tsx`
* `/components/SideMenu/OverlayToggle.tsx`
* `/components/SideMenu/RouteSelector.tsx`
* `/components/SideMenu/TransferOptions.tsx`

### Tasks

1. Render AntD `Drawer` pinned left.
2. `OverlayToggle` dispatches `setOverlayVisible`.
3. `RouteSelector` shows placeholder Select.
4. `TransferOptions` shows Slider (0‑3).

### Deliverable

* Menu opens/closes; toggle updates store flag (verify via devtools).

---

## Sprint 10 – Routes & Reachability Overlays

**Objective:** Visualise selected route and reachable stations.

### Files

* `/hooks/useRoutes.ts`
* `/hooks/useReachableStations.ts`
* `/components/Overlays/RoutesOverlay.tsx`
* `/components/Overlays/ReachabilityHighlight.tsx`

### Tasks

1. Implement hooks using API layer; cache result in store.
2. `RoutesOverlay` draws polylines & station markers for current route.
3. `ReachabilityHighlight` clusters reachable stations (use `leaflet.markercluster`).
4. Wire SideMenu controls to trigger fetch & overlay visibility.

### Deliverable

* Selecting route highlights it; setting transfers shades additional stations.

---

## Sprint 11 – Coverage Circle Feature

**Objective:** Show geographic radius around selected station.

### Files

* `/hooks/useCircleOverlay.ts`
* `/components/Overlays/CoverageCircle.tsx`

### Tasks

1. Implement hook creating/destroying `L.Circle`.
2. Connect to store `circleRadiusKm` changes.
3. Update SideMenu with radius selector (1|3|5 km).

### Deliverable

* Circle updates live when radius slider moves.

---

## Sprint 12 – Polish, Tests & Docs

**Objective:** Ensure production readiness.

### Tasks

1. Achieve 100 % unit test coverage on hooks & slices.
2. Add happy‑path integration tests for `MapPage` with msw.
3. Run Lighthouse audit; fix major accessibility issues.
4. Update `README.md` with setup & run instructions.
5. Tag `v1.0.0`.

### Deliverable

* CI pipeline green; `npm run build` produces minified assets ready for embed.

---

**End of Plan**
