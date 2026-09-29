const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { apiLimiter } = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const journeyRoutes = require("./routes/journeyRoutes");
const aiRoutes = require("./routes/aiRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

const app = express();

// --- Security middleware ---
app.use(helmet()); // sets safe HTTP headers (XSS, sniffing, clickjacking protection)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" })); // body size limit to reduce DoS surface
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(apiLimiter);

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "SafarSaathi API is running.", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/journey", journeyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/emergency", emergencyRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
