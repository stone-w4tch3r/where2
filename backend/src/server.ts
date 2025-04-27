import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { stationRoutes } from "./api/routes/stationRoutes"
import { routeRoutes } from "./api/routes/routeRoutes"
import { reachabilityRoutes } from "./api/routes/reachabilityRoutes"

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// API routes
app.use("/api/stations", stationRoutes)
app.use("/api/routes", routeRoutes)
app.use("/api/reachability", reachabilityRoutes)

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Where2 API",
      version: "1.0.0",
      description: "API for Where2 suburban trains application",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/api/routes/*.ts"],
}

const swaggerDocs = swaggerJsdoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
  console.log(`API documentation available at http://localhost:${port}/api-docs`)
})
