const express = require("express");

const authController = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

console.log("registerValidator:", typeof registerValidator);
console.log("loginValidator:", typeof loginValidator);
console.log("authController.register:", typeof authController.register);
console.log("authController.login:", typeof authController.login);
console.log("protect:", typeof protect);

// Public routes
router.post("/register", registerValidator, authController.register);

router.post("/login", loginValidator, authController.login);

// Protected route
router.get("/me", protect, authController.getMe);

module.exports = router;
