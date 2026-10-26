const express = require("express");

const transactionController = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Credit the authenticated user's wallet
router.post("/credit", protect, transactionController.creditWallet);

// Debit the authenticated user's wallet
router.post("/debit", protect, transactionController.debitWallet);

module.exports = router;
