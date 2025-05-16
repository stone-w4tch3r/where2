import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { StationService } from "./services/StationService";
import { RouteService } from "./services/RouteService";
import { TransferCalculator } from "./services/TransferCalculator";
import { StationController } from "./controllers/stationController";
import { RouteController } from "./controllers/routeController";
import { ReachabilityController } from "./controllers/reachabilityController";
import { createApiRouter } from "./routes/api";
import { YandexRaspClient } from "./yandex/client";

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Yandex API client
const apiKey = process.env.YANDEX_API_KEY || "";
if (!apiKey) {
  console.warn("YANDEX_API_KEY not set, API functionality will be limited");
}
const yandexClient = new YandexRaspClient(apiKey);

// Initialize services
const stationService = new StationService(yandexClient);
const routeService = new RouteService(yandexClient);
const transferCalculator = new TransferCalculator(routeService);

// Initialize controllers
const stationController = new StationController(stationService);
const routeController = new RouteController(routeService);
const reachabilityController = new ReachabilityController(transferCalculator);

// API routes
const apiRouter = createApiRouter(
  stationController,
  routeController,
  reachabilityController
);
app.use("/api", apiRouter);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
