
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./auth.js";
import "./db.js";
import streakRoutes from "./streak.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("Set a JWT_SECRET of at least 32 characters.");
}

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "20kb" }));

// Root route
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "EVOLV API is running!",
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "EVOLV API",
  });
});

// Authentication routes
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  authRoutes
);

// Learning streak routes
app.use("/api/streak", streakRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`EVOLV API running on port ${PORT}`);
});