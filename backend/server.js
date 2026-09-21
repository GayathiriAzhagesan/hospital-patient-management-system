import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDbStatus } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients (Vercel, custom domain, production deployments)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Express Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[REST API ${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Medicare Portal Healthcare REST API",
    version: "2.0.0",
    database: getDbStatus() ? "MongoDB Atlas (Connected)" : "Connecting / Standby",
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/invoices", invoiceRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server and connect to MongoDB
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🏥 Medicare Portal API Server running on port ${PORT}`);
    console.log(`📡 Server listening on port: ${PORT}`);
    console.log(`📊 Health Check endpoint: /api/health`);
    console.log(`🛡️  JWT & Role-Based Access Control (RBAC) Active`);
    console.log(`========================================================`);
  });
};

// Auto-start in standard Node environment
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
