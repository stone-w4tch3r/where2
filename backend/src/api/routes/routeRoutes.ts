import express from "express"
import { RouteController } from "../controllers/routeController"
import { RouteService } from "../../services/routeService"
import { RouteRepository } from "../../repositories/routeRepository"

const router = express.Router()
const routeRepository = new RouteRepository()
const routeService = new RouteService(routeRepository)
const routeController = new RouteController(routeService)

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Get all routes or routes by station ID
 *     tags: [Routes]
 *     parameters:
 *       - in: query
 *         name: stationId
 *         schema:
 *           type: string
 *         description: Station ID to filter routes
 *     responses:
 *       200:
 *         description: List of routes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Route'
 */
router.get("/", (req, res) => {
  const stationId = req.query.stationId as string
  if (stationId) {
    return routeController.getRoutesByStationId(req, res)
  }
  return routeController.getAllRoutes(req, res)
})

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Get route by ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       404:
 *         description: Route not found
 */
router.get("/:id", (req, res) => routeController.getRouteById(req, res))

export { router as routeRoutes }
