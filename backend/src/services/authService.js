const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Wallet = require("../models/Wallet");

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }

  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Return only safe user information
const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

// Register a new user and create their wallet
const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check whether the email is already registered
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  // Create wallet for the newly registered user
  await Wallet.create({
    user: user._id,
    balance: 0,
    currency: "INR",
  });

  // Generate authentication token
  const token = generateToken(user._id);

  return {
    user: formatUser(user),
    token,
  };
};

// Login an existing user
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Password is select:false in the User model,
  // so explicitly include it for password comparison
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Compare entered password with hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Reject inactive accounts
  if (!user.isActive) {
    const error = new Error("This account has been deactivated");
    error.statusCode = 403;
    throw error;
  }

  // Generate authentication token
  const token = generateToken(user._id);

  return {
    user: formatUser(user),
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
