import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { setupRoutes } from "./routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Setup routes
setupRoutes(app);

// Start server
const PORT = process.env.MICROSERVICE_PORT || 3000;
const HOST = process.env.MICROSERVICE_HOST || "localhost";

app.listen(PORT, HOST, () => {
  console.log("=".repeat(50));
  console.log("🚀 Microservice Started");
  console.log("=".repeat(50));
  console.log(`📍 URL: http://${HOST}:${PORT}`);
  console.log(`🔑 API Key: ${process.env.API_KEY || "Not set"}`);
  console.log("\n📚 Available Endpoints:");
  console.log("  PUBLIC (Exposed via MCP):");
  console.log("    GET  /api/health");
  console.log("    GET  /api/users/:id");
  console.log("    GET  /api/products");
  console.log("    POST /api/orders");
  console.log("\n  RESTRICTED (NOT Exposed via MCP):");
  console.log("    DELETE /api/users/:id");
  console.log("    GET    /api/admin/stats");
  console.log("    POST   /api/admin/reset");
  console.log("=".repeat(50));
});
