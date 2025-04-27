import express from "express"
import { StationController } from "../controllers/stationController"
import { StationService } from "../../services/stationService"
import { StationRepository } from "../../repositories/stationRepository"

const router = express.Router()
const stationRepository = new StationRepository()
const stationService = new StationService(stationRepository)
const stationController = new StationController(stationService)

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Get all stations
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: List of stations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Station'
 */
router.get("/", (req, res) => stationController.getAllStations(req, res))

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Get station by ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Station ID
 *     responses:
 *       200:
 *         description: Station details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       404:
 *         description: Station not found
 */
router.get("/:id", (req, res) => stationController.getStationById(req, res))

/**
 * @swagger
 * /api/stations/region/{region}:
 *   get:
 *     summary: Get stations by region
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: region
 *         schema:
 *           type: string
 *         required: true
 *         description: Region name
 *     responses:
 *       200:
 *         description: List of stations in the region
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Station'
 */
router.get("/region/:region", (req, res) => stationController.getStationsByRegion(req, res))

export { router as stationRoutes }
