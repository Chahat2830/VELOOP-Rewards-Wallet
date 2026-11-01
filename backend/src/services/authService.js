const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ userId: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
const formatUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});
async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) {
    const e = new Error("Email is already registered");
    e.statusCode = 409;
    throw e;
  }
  const session = await require("mongoose").startSession();
  try {
    let user;
    await session.withTransaction(async () => {
      const [created] = await User.create(
        [
          {
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
          },
        ],
        { session },
      );
      user = created;
      await Wallet.create([{ user: user._id }], { session });
    });
    return { user: formatUser(user), token: generateToken(user._id) };
  } finally {
    await session.endSession();
  }
}
async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    "+password",
  );
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const e = new Error("Invalid email or password");
    e.statusCode = 401;
    throw e;
  }
  if (!user.isActive) {
    const e = new Error("This account has been deactivated");
    e.statusCode = 403;
    throw e;
  }
  return { user: formatUser(user), token: generateToken(user._id) };
}
module.exports = { registerUser, loginUser };
