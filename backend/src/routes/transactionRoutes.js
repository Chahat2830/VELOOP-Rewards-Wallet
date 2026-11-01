const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const controller = require("../controllers/transactionController");
const {
  validateCredit,
  validateDebit,
  validateHistory,
} = require("../validators/walletValidator");

router.get("/", protect, validateHistory, controller.getTransactionHistory);
router.post(
  "/credit",
  protect,
  requireAdmin,
  validateCredit,
  controller.creditWallet,
);
router.post(
  "/debit",
  protect,
  requireAdmin,
  validateDebit,
  controller.debitWallet,
);

module.exports = router;
