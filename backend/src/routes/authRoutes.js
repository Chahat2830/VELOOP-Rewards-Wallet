const express = require("express");

const authController = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);

// Protected route
router.get("/me", protect, authController.getMe);

module.exports = router;
