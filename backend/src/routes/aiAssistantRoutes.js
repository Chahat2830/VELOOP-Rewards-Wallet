const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/aiAssistantController");

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI assistant requests. Please wait a minute and try again.",
  },
});

router.post(
  "/chat",
  protect,
  aiLimiter,
  body("question")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Question is required.")
    .isLength({ max: 1000 })
    .withMessage("Question must be 1000 characters or fewer."),
  body("conversation")
    .optional()
    .isArray({ max: 8 })
    .withMessage("Conversation must contain at most 8 messages."),
  controller.chat,
);

module.exports = router;
