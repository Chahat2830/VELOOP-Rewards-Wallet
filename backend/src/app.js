const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const aiAssistantRoutes = require("./routes/aiAssistantRoutes");

const { notFound, errorHandler } = require("./utils/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VELOOP Wallet API is running",
  });
});

// Existing API routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payouts", payoutRoutes);

// AI Financial Assistant API
app.use("/api/ai-assistant", aiAssistantRoutes);

// 404 and error handlers MUST remain last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
