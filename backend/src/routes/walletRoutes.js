const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/walletController");
router.get("/", protect, controller.getMyWallet);
router.get("/summary", protect, controller.getSummary);
module.exports = router;
