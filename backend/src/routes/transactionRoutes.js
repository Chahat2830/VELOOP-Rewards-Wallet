const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

// Transaction history
router.get("/", protect, transactionController.getTransactionHistory);

// Wallet credit
router.post("/credit", protect, transactionController.creditWallet);

// Wallet debit
router.post("/debit", protect, transactionController.debitWallet);

module.exports = router;
