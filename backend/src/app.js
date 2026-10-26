const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VELOop Rewards Wallet API is running",
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "Backend is healthy",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Wallet routes
app.use("/api/wallet", walletRoutes);

// Transaction routes — use plural "transactions"
app.use("/api/transactions", transactionRoutes);

// 404 handler — must remain after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

module.exports = app;
