import express from "express"
import { ReachabilityController } from "../controllers/reachabilityController"
import { ReachabilityService } from "../../services/reachabilityService"
import { RouteRepository } from "../../repositories/routeRepository"

const router = express.Router()
const routeRepository = new RouteRepository()
const reachabilityService = new ReachabilityService(routeRepository)
const reachabilityController = new ReachabilityController(reachabilityService)

/**
 * @swagger
 * /api/reachability:
 *   get:
 *     summary: Calculate reachable stations from a given station
 *     tags: [Reachability]
 *     parameters:
 *       - in: query
 *         name: stationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Origin station ID
 *       - in: query
 *         name: maxTransfers
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Maximum number of transfers
 *     responses:
 *       200:
 *         description: Reachability calculation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReachabilityResult'
 *       400:
 *         description: Invalid request parameters
 */
router.get("/", (req, res) => reachabilityController.calculateReachability(req, res))

export { router as reachabilityRoutes }
