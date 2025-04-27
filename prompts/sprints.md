# Project Sprint Plan: Suburban Trains Map Overlay

---

# 🏁 Sprint 1: Backend + Debug UI

## Backend

- Set up Express server with TypeScript.
- Global error handler (`Promise<Result<T, E>>` pattern).
- Connect Supabase via Prisma:
  - Migrate `stations`, `routes`, `route_stops` tables.
- Finalize Yandex.Rasp API Adapter:
  - Fetch stations and routes.
  - Save to database.
- Batch Processor CLI:
  - Cronjob for regular imports.
- Expose API Endpoints:
  - `GET /stations`
  - `GET /routes?stationId=`
  - `GET /reachability?stationId=&maxTransfers=`
- Swagger/OpenAPI documentation.

## Frontend

- Create simple Next.js app.
- No map, no stores.
- Basic debug forms using Antd + React Hook Form + Zod:
  - **Load Stations**
  - **Load Routes by StationId**
  - **Calculate Reachability**
- Show raw JSON response.

## File Structure

```
/backend
  /src/api/controllers
  /src/api/routes
  /src/api/schemas
  /src/services
  /src/external/yandex
  /src/batch
  /src/db
  /src/utils
  app.ts, server.ts
/prisma
/swagger
/frontend
  /src/pages/debug
  /src/components
  /src/api
  /src/types
```

---

# 🌿 Sprint 2: Standalone Map App

## Frontend

- Real Next.js page `/map`.
- Leaflet map + OpenRailwayMap tiles.
- Add:
  - Routes overlay
  - Coverage circle overlay
  - Reachability highlight
  - Station popups
- Ant Design Side Menu:
  - Select route
  - Select station
  - Adjust reachability settings

## State Management

- Zustand store:
  - UI state (selected station/route, overlays)
  - Data state (stations, routes, reachability)
  - Map state (center, zoom)

## File Structure Changes

```
/frontend
  /src/pages/map
  /src/components/map
  /src/hooks
  /src/store
  /src/api
  /src/types
```

---

# 🌍 Sprint 3: Embeddable Widget + Browser Extension

## Embeddable App

- Create `embeddableOverlay.ts` and `embeddableInit.ts`.
- Attach to any existing map provider.
- Provide global API `window.initOverlay()`.

## Browser Extension

- Manifest V3 extension:
  - `popup.tsx` page.
  - `contentScript.ts`, `background.ts`.
- Inject overlay into Google Maps, Yandex Maps, etc.
- Switchable Dev Mode (Yandex Leaflet plugin).

## File Structure Changes

```
/frontend
  /src/embeddable
  /src/extension
/extension
  manifest.json
  icons/
```

---

