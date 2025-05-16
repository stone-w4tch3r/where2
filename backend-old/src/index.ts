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
import { DatabaseService } from "./services/DatabaseService";
import { DataProcessor } from "./services/DataProcessor";
import { YandexRaspClient } from "./yandex/yandexRaspClient";
import { CronJobManager } from "./utils/cronJobs";

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Yandex API client
const yandexClient = new YandexRaspClient();

// Initialize database service
const databaseService = new DatabaseService();

// Initialize data processor for batch imports
const dataProcessor = new DataProcessor(yandexClient, databaseService);

// Initialize cron job manager
const cronJobManager = new CronJobManager(dataProcessor);

// Initialize services
const stationService = new StationService(databaseService);
const routeService = new RouteService(databaseService);
const transferCalculator = new TransferCalculator(databaseService);

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

// Initialize the database connection
databaseService.init().then((connected) => {
  if (connected) {
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Start cron jobs after server is running
      cronJobManager.startAll();
    });

    // Add route for manually triggering data processing
    app.post(
      "/api/admin/process-data",
      async (_req: Request, res: Response) => {
        const result = await dataProcessor.processAllData();

        if (result.success) {
          res.json({ success: true, message: result.data });
        } else {
          res.status(500).json({ success: false, error: result.error });
        }
      }
    );
  } else {
    console.error("Failed to connect to database. Exiting...");
    process.exit(1);
  }
});

// Setup graceful shutdown
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

function shutdown() {
  console.log("Shutting down server...");

  // Stop all cron jobs
  cronJobManager.stopAll();

  // Close database connections
  databaseService.close();

  process.exit(0);
}
