const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const { notFound, errorHandler } = require("./utils/errorHandler");
const app = express();
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
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "VELOOP Wallet API is running" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payouts", payoutRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
