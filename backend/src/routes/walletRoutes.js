const express = require("express");

const walletController = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get the authenticated user's wallet
router.get("/", protect, walletController.getMyWallet);

module.exports = router;
