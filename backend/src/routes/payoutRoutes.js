const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const controller = require("../controllers/payoutController");
const {
  validateWithdrawal,
  validateId,
  validateReject,
  validatePagination,
} = require("../validators/payoutValidator");

router.get("/options", protect, controller.getPayoutOptions);
router.post("/", protect, validateWithdrawal, controller.createPayoutRequest);
router.get("/", protect, validatePagination, controller.getMyPayouts);
router.get("/:id", protect, validateId, controller.getMyPayoutById);
router.patch(
  "/:id/process",
  protect,
  requireAdmin,
  validateId,
  controller.processPayout,
);
router.patch(
  "/:id/approve",
  protect,
  requireAdmin,
  validateId,
  controller.approvePayout,
);
router.patch(
  "/:id/reject",
  protect,
  requireAdmin,
  validateReject,
  controller.rejectPayout,
);

module.exports = router;
