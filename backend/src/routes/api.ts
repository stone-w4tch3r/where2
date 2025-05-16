import express, { Router } from "express";
import { StationController } from "../controllers/stationController";
import { RouteController } from "../controllers/routeController";
import { ReachabilityController } from "../controllers/reachabilityController";

export function createApiRouter(
  stationController: StationController,
  routeController: RouteController,
  reachabilityController: ReachabilityController
): Router {
  const router = express.Router();

  // Station routes
  router.get("/stations", (req, res) =>
    stationController.getAllStations(req, res)
  );
  router.get("/stations/:id", (req, res) =>
    stationController.getStationById(req, res)
  );
  router.get("/stations/nearby", (req, res) =>
    stationController.getStationsByLocation(req, res)
  );

  // Route routes
  router.get("/routes", (req, res) => routeController.getAllRoutes(req, res));
  router.get("/routes/:id", (req, res) =>
    routeController.getRouteById(req, res)
  );
  router.get("/stations/:stationId/routes", (req, res) =>
    routeController.getRoutesByStation(req, res)
  );

  // Reachability routes
  router.get("/reachability", (req, res) =>
    reachabilityController.getReachableStations(req, res)
  );

  return router;
}
