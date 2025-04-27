---
---

I need to build an application about suburban train routes. It displays stations and routes on a map and allows to calculate reachability between stations based on transfer count. App DOES NOT uses any scheduling/timetable system for simplicity.

List if features:

- Show Stations on a map
- Show all Routes in a selected station
- Select a Route in a list and visualize it/all it's stations on a map
- Visualize all stations that are reachable from a selected stations

Reachability is calculated very simple: stations that share same Routes that this Station or are accessible via N transfers between routes

Backend data is fetched on third-party Yandex Schedule API that is complex and has a lot of information.

Focus on backend:

- define internal Models
- create DB schema
- architecture data transformation flow from API contracts to those Models

Use mermaid diagrams

In models avoid primitive obsession where possible and suitable, especially in codes/ids etc

API structure:

---

Now you have full app's architecture and description.

Convert this declarative/descriptive documentation