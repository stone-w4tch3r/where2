Help me to create architecture for my fullstack ts pet project. Time plan is one week. Use mermaid diagrams. Do not write any code.

## app description

Embeddable map overlay with suburban trains data:
- routes
- schedule
- stations
- reachable area from stations

Compatible with different map providers: google/yandex etc

Schedule data provided via yandex.rasp API, preprocessed on backend

## UI

1. main menu at the side of a map
2. toggle this overlay on/off
3. click on a station shows menu routes and schedules on this station
4. selecting a route in menu shows all other stations in this route
5. user can highlight all stations reachable from this station
6. option to account for changes
7. each station shows "reachability" circle with configurable in main menu radius

## front

1. typescript
2. react
3. next js (no ssr)
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
