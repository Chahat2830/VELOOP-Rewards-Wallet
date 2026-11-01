require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be provided.",
    );
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("Admin password must contain at least 8 characters.");
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();

  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error(
      "This email is already registered. No account was changed.",
    );
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

      const [admin] = await User.create(
        [
          {
            name: ADMIN_NAME.trim(),
            email,
            password: hashedPassword,
            role: "admin",
            isActive: true,
          },
        ],
        { session },
      );

      await Wallet.create([{ user: admin._id }], { session });

      console.log("Admin account created successfully.");
      console.log("Admin email:", email);
      console.log("Role: admin");
    });
  } finally {
    await session.endSession();
  }
}

createAdmin()
  .catch((error) => {
    console.error("Admin provisioning failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
