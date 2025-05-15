## app description

Embeddable map overlay with suburban trains data:

- routes
- schedule
- stations
- reachable area from stations

Compatible with different map providers: google/yandex etc

Routes data provided via Yandex.Rasp API, preprocessed on backend. Scheduling and timetables are omitted for simplicity.

User can navigate to Yandex.Rasp webpage from selected route/station etc by urls that are already provided by API

Yandex Rasp has a lot of data, app will use only Sverdlovsk Region, Russia

## UI

1. main menu at the side of a map
2. toggle this overlay on/off
3. click on a station shows menu routes and schedules on this station
4. selecting a route in menu shows all other stations in this route
5. user can highlight all stations reachable from this station
6. option to account for changes
7. each station shows "coverage" circle with configurable in main menu radius

## front

1. typescript
2. react
3. vite
4. antd
5. zod
6. zustand
7. react query
8. react hook form
9. leaflet map
10. provider-specific leaflet plugins
11. openrailwaymap tiles for routes
12. turf.js for calculations

## back

1. typescript
2. express
3. prisma
4. supabase
5. zod
6. axios
7. swagger
