
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./auth.js";
import streakRoutes from "./streak.js";

// Validate Supabase configuration before starting the server.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing Supabase configuration. Set SUPABASE_URL and a Supabase API key in backend/.env."
  );
}

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Frontend origins allowed to access the API.
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://evolv-x-eight.vercel.app",
]);

// Security headers.
app.use(helmet());

// CORS configuration.
app.use(
  cors({
    origin(origin, callback) {
      // Permit requests without an Origin header, such as health checks.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Parse JSON request bodies.
app.use(express.json({ limit: "20kb" }));

// Basic request logging.
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Root endpoint.
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "EVOLV API is running!",
    database: "Supabase",
    authentication: "Supabase Auth",
  });
});

// Health check. This confirms the API process is running,
// not that every Supabase table is accessible.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    app: "EVOLV API",
    database: "Supabase",
  });
});

// Rate limit authentication-related requests.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication requests. Please try again later.",
  },
});

// Authentication routes.
app.use("/api/auth", authLimiter, authRoutes);

// Learning streak routes.
app.use("/api/streak", streakRoutes);

// Handle unknown endpoints.
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found.",
  });
});

// Centralized error handler.
app.use((error, _req, res, _next) => {
  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "This origin is not allowed to access the API.",
    });
  }

  console.error("API error:", error);

  return res.status(500).json({
    success: false,
    error: "An unexpected server error occurred.",
  });
});

// Start the server.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`EVOLV API running on port ${PORT}`);
  console.log("Database: Supabase");
  console.log("Authentication: Supabase Auth");
});