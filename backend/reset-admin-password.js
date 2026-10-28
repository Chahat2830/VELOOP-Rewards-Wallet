require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Enter the new password for your admin account: ",
  async (password) => {
    try {
      if (!password || password.length < 8) {
        throw new Error("Password must contain at least 8 characters.");
      }

      const mongoUri =
        process.env.MONGODB_URI ||
        process.env.MONGO_URI ||
        process.env.MONGO_URL;

      if (!mongoUri) {
        throw new Error(
          "MongoDB URI not found. Check the variable name in your .env file.",
        );
      }

      await mongoose.connect(mongoUri);

      const user = await User.findOne({
        email: "chahat@example.com",
      }).select("+password");

      if (!user) {
        throw new Error("Admin test account was not found.");
      }

      user.password = await bcrypt.hash(password, 12);
      user.role = "admin";
      user.isActive = true;

      await user.save();

      console.log("Password reset successfully.");
      console.log("Account: chahat@example.com");
      console.log("Role: admin");
    } catch (error) {
      console.error("Password reset failed:", error.message);
    } finally {
      await mongoose.disconnect().catch(() => {});
      rl.close();
    }
  },
);
