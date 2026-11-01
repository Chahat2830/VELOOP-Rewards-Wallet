const mongoose = require("mongoose");

const currencies = ["VES", "SVES", "GEMS", "TOKENS", "SPINS"];
const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balances: {
      VES: { type: Number, default: 0, min: 0 },
      SVES: { type: Number, default: 0, min: 0 },
      GEMS: { type: Number, default: 0, min: 0 },
      TOKENS: { type: Number, default: 0, min: 0 },
      SPINS: { type: Number, default: 0, min: 0 },
    },
    reservedBalances: {
      VES: { type: Number, default: 0, min: 0 },
      SVES: { type: Number, default: 0, min: 0 },
      GEMS: { type: Number, default: 0, min: 0 },
      TOKENS: { type: Number, default: 0, min: 0 },
      SPINS: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true, minimize: false },
);

walletSchema.statics.currencies = currencies;
module.exports = mongoose.model("Wallet", walletSchema);
