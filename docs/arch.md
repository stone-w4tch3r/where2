## System Architecture

```mermaid
flowchart TD
    subgraph "Frontend"
        UI[React UI]
        MapComponent[Leaflet Map Component]
        StateManagement[Zustand Store]
        APIClient[React Query API Client]
        MapPlugins[Map Provider Plugins]
        RoutesOverlay[Routes Overlay]
        CoverageCircle[Coverage Circle Overlay]
    end

    subgraph "Backend"
        API[NestJS API]
        DataImporter[Schedule Data Importer]
        CronJobManager[Cron Job Manager]
        ExternalAPI[Yandex.Rasp API Client]
        Cache[Data Cache]
        DB[Supabase/Prisma]
        RouteService[Route Service]
        TransferCalculator[Transfer Calculator]
    end

    ExternalSources[Yandex.Rasp API]
    MapProviders[Map Providers]

    UI --> StateManagement
    UI --> MapComponent
    MapComponent --> MapPlugins
    MapComponent --> RouteHighlighter
    MapComponent --> CircleOverlay
    MapPlugins --> MapProviders
    StateManagement --> APIClient
    APIClient --> API
    API --> DataImporter
    API --> RouteService
    API --> TransferCalculator
    CronJobManager --> DataImporter
    DataImporter --> ExternalAPI
    ExternalAPI --> ExternalSources
    DataImporter --> DB
    API --> DB
    API --> Cache
```

## UI Component Structure

```mermaid
flowchart TD
    subgraph "Pages"
        MapPage[Map Page]
    end

    subgraph "Components"
        MapContainer[Map Container]
        SideMenu[Side Menu]
        StationPopup[Station Popup]
        RouteSelector[Route Selector]
        RoutesOverlay[Routes Overlay]
        StationList[Station List]
        ScheduleView[Schedule View]
        CoverageCircle[Coverage Circle]
        ReachabilityHighlight[Reachability Highlighter]
        OverlayToggle[Overlay Toggle]
        TransferOptions[Transfer Options]
    end

    subgraph "Hooks"
        useMapProvider[useMapProvider]
        useStations[useStations]
        useRoutes[useRoutes]
        useSchedule[useSchedule]
        useReachableStations[useReachableStations]
        useCircleOverlay[useCircleOverlay]
    end

    MapPage --> MapContainer
    MapPage --> SideMenu
    MapContainer --> StationPopup
    MapContainer --> RoutesOverlay
    MapContainer --> CoverageCircle
    MapContainer --> ReachabilityHighlight
    SideMenu --> OverlayToggle
    SideMenu --> RouteSelector
    SideMenu --> TransferOptions
    RouteSelector --> StationList
    StationPopup --> ScheduleView

    MapContainer --> useMapProvider
    StationPopup --> useStations
    RoutesOverlay --> useRoutes
    RouteSelector --> useRoutes
    ScheduleView --> useSchedule
    CoverageCircle --> useCircleOverlay
    ReachabilityHighlight --> useReachableStations
    TransferOptions --> useReachableStations
```

## Backend API Layer

```mermaid
flowchart TB
  %% Batch import
  subgraph Batch Processor
    CronJobManager[Cron Job Manager<br/>scheduled tasks]
    DataImporter[Schedule Data Importer]
    ExternalAPI[Yandex.Rasp API]
    CronJobManager --> DataImporter
    DataImporter --> ExternalAPI
    DataImporter --> DB[(Supabase/Prisma)]
  end

  %% Runtime API
  subgraph NestJS Runtime
    API[NestJS API]
    API -->|GET /stations| StationCtrl[StationController]
    API -->|GET /routes| RouteCtrl[RouteController]
    API -->|GET /reachability| ReachCtrl[ReachabilityController]
    API -->|POST /admin/process-data| ManualImport[Manual Import]
    API -->|POST /admin/cron/start| CronStart[Start Cron Jobs]
    API -->|POST /admin/cron/stop| CronStop[Stop Cron Jobs]

    StationCtrl --> StationSvc[StationService]
    RouteCtrl   --> RouteSvc[RouteService]
    ReachCtrl   --> ReachSvc[TransferCalculator]
    ManualImport --> DataImporter
    CronStart --> CronJobManager
    CronStop --> CronJobManager

    StationSvc  --> DB
    RouteSvc    --> DB
    ReachSvc    --> DB
    ReachSvc    --> Cache[(Redis Cache)]
  end
```

## Reachability Calculation Flow (Backend)

```mermaid
flowchart TD
    Start[User selects station] --> SelectTransfers[User sets max transfers]
    SelectTransfers --> LoadRoutes[Load routes for station from DB]
    LoadRoutes --> DirectStations[Find stations on same routes]
    DirectStations --> HasTransfers{Transfers > 0?}

    HasTransfers -- Yes --> CalculateTransfers[Calculate stations with transfers]
    HasTransfers -- No --> ReturnResults[Return reachable stations]

    CalculateTransfers --> ReturnResults
    ReturnResults --> Highlight[Highlight stations on map]
```

## Frontend "Stations / Routes / Reachability" Data Flow

```mermaid
flowchart LR
  %% User triggers
  UI[User Interaction<br/>select station/route/toggle overlay]

  %% React hooks
  subgraph Hooks
    S[useStations]
    R[useRoutes]
    V[useReachableStations]
  end

  %% API client & storage
  API[React Query<br/>API Client]
  Store[Zustand Store]

  %% Map overlays
  Overlays[Map Overlays<br/>RoutesOverlay,<br/>CoverageCircle,<br/>ReachabilityHighlight]
  Map[Leaflet Map]

  %% Flow
  UI --> S
  UI --> R
  UI --> V

  S --> API
  R --> API
  V --> API

  API -->|GET /stations| Backend
  API -->|GET /routes?stationId=| Backend
  API -->|GET /reachability?stationId=&maxTransfers=| Backend

  API --> Store
  Store --> Overlays
  Overlays --> Map
```

## Feature Implementation Details

### 1. Route Selection in Menu

When a user selects a route from the menu:

- The frontend searches cache for routes and loads it's stations
- The frontend highlights these stations on the map and can optionally display them in a list

### 2. Station Reachability Highlighting

This feature shows which stations can be reached from a selected station:

- Direct connections: Stations on the same route(s) as the selected station
- Transfer connections: Stations reachable with N transfers (configurable by user)
- The backend calculates this using a graph-based algorithm considering:
  - Routes that share stations (transfer points)

### 3. Coverage Circle vs. Reachable Stations

Two distinct features:

1. **Coverage Circle**: A simple geographic radius around a station (e.g., 1km, 3km)

   - Visualizes the physical area covered by the station
   - Configurable radius in the main menu
   - Implemented using Leaflet's circle overlay via the `CoverageCircle` component

2. **Reachable Stations**: Stations connected by train routes
   - Shows network connectivity rather than geographic proximity
   - Based on route connections and possible transfers
   - Visualized by highlighting stations on the map

## State Management Structure

```mermaid
flowchart TD
    subgraph "Zustand Store"
        subgraph "UI State"
            OverlayVisible[Overlay Visible]
            SelectedStation[Selected Station]
            SelectedRoute[Selected Route]
            MaxTransfers[Max Transfers]
            CircleRadius[Circle Radius]
        end

        subgraph "Data State"
            Stations[Stations]
            Routes[Routes]
            Schedules[Schedules]
            ReachableStations[Reachable Stations]
        end

        subgraph "Map State"
            MapProvider[Map Provider]
            MapCenter[Map Center]
            MapZoom[Map Zoom]
            HighlightedElements[Highlighted Elements]
        end
    end

    OverlayVisible --> HighlightedElements
    SelectedStation --> ReachableStations
    SelectedRoute --> HighlightedElements
    MaxTransfers --> ReachableStations
    CircleRadius --> HighlightedElements
```
