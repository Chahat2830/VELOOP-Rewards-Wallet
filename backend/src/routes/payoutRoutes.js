const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const payoutController = require("../controllers/payoutController");

const router = express.Router();

// Authenticated customer routes
router.post("/", protect, payoutController.createPayoutRequest);
router.get("/", protect, payoutController.getMyPayouts);
router.get("/:id", protect, payoutController.getMyPayoutById);

// Admin-only routes
router.patch(
  "/:id/approve",
  protect,
  requireAdmin,
  payoutController.approvePayout,
);

router.patch(
  "/:id/reject",
  protect,
  requireAdmin,
  payoutController.rejectPayout,
);

module.exports = router;
