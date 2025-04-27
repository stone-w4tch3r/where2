import prismaClient from "../db/client"
import { Route } from "../domain/entities"
import { RouteId, StationId, type TransportMode } from "../domain/valueObjects"
import { type Result, createSuccess, createFailure } from "../external/yandex/utils/result"

export class RouteRepository {
  /**
   * Saves a route to the database
   */
  async save(route: Route): Promise<Result<Route>> {
    try {
      // Use a transaction to ensure route and stops are saved atomically
      await prismaClient.$transaction(async (tx) => {
        // Create or update the route
        await tx.route.upsert({
          where: { id: route.id.value },
          update: {
            shortTitle: route.shortTitle,
            fullTitle: route.fullTitle,
            transportMode: route.mode,
            routeInfoUrl: route.routeInfoUrl,
          },
          create: {
            id: route.id.value,
            shortTitle: route.shortTitle,
            fullTitle: route.fullTitle,
            transportMode: route.mode,
            routeInfoUrl: route.routeInfoUrl,
          },
        })

        // Delete existing route stops
        await tx.routeStop.deleteMany({
          where: { routeId: route.id.value },
        })

        // Create new route stops
        for (let i = 0; i < route.stops.length; i++) {
          await tx.routeStop.create({
            data: {
              routeId: route.id.value,
              stationId: route.stops[i].value,
              stopPosition: i,
            },
          })
        }
      })

      return createSuccess(route)
    } catch (error) {
      return createFailure(`Failed to save route: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Finds a route by its ID
   */
  async findById(id: RouteId): Promise<Result<Route | null>> {
    try {
      const routeData = await prismaClient.route.findUnique({
        where: { id: id.value },
        include: {
          routeStops: {
            orderBy: { stopPosition: "asc" },
            include: { station: true },
          },
        },
      })

      if (!routeData) {
        return createSuccess(null)
      }

      const stops = routeData.routeStops.map((stop) => new StationId(stop.stationId))

      const route = new Route(
        new RouteId(routeData.id),
        routeData.shortTitle,
        routeData.fullTitle,
        routeData.transportMode as TransportMode,
        routeData.routeInfoUrl || "",
        stops,
      )

      return createSuccess(route)
    } catch (error) {
      return createFailure(`Failed to find route: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Finds all routes
   */
  async findAll(): Promise<Result<Route[]>> {
    try {
      const routesData = await prismaClient.route.findMany({
        include: {
          routeStops: {
            orderBy: { stopPosition: "asc" },
          },
        },
      })

      const routes = routesData.map((routeData) => {
        const stops = routeData.routeStops.map((stop) => new StationId(stop.stationId))

        return new Route(
          new RouteId(routeData.id),
          routeData.shortTitle,
          routeData.fullTitle,
          routeData.transportMode as TransportMode,
          routeData.routeInfoUrl || "",
          stops,
        )
      })

      return createSuccess(routes)
    } catch (error) {
      return createFailure(`Failed to find routes: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Finds routes by station ID
   */
  async findByStationId(stationId: StationId): Promise<Result<Route[]>> {
    try {
      const routeStops = await prismaClient.routeStop.findMany({
        where: { stationId: stationId.value },
        include: {
          route: {
            include: {
              routeStops: {
                orderBy: { stopPosition: "asc" },
              },
            },
          },
        },
      })

      const routes = routeStops.map((routeStop) => {
        const routeData = routeStop.route
        const stops = routeData.routeStops.map((stop) => new StationId(stop.stationId))

        return new Route(
          new RouteId(routeData.id),
          routeData.shortTitle,
          routeData.fullTitle,
          routeData.transportMode as TransportMode,
          routeData.routeInfoUrl || "",
          stops,
        )
      })

      return createSuccess(routes)
    } catch (error) {
      return createFailure(
        `Failed to find routes by station: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
