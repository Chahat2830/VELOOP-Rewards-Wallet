const mongoose = require("mongoose");

const CREDIT_TYPES = [
  "REWARD",
  "BONUS",
  "REFERRAL",
  "DAILY_REWARD",
  "AD_REWARD",
  "GAME_REWARD",
  "ADMIN_CREDIT",
  "EXCHANGE_CREDIT",
];
const DEBIT_TYPES = [
  "WITHDRAWAL",
  "EXCHANGE_DEBIT",
  "ADMIN_DEBIT",
  "CORRECTION",
];
const currencies = ["VES", "SVES", "GEMS", "TOKENS", "SPINS"];

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    currency: { type: String, enum: currencies, required: true },
    type: {
      type: String,
      enum: [...CREDIT_TYPES, ...DEBIT_TYPES],
      required: true,
    },
    amount: { type: Number, required: true, min: 0.000001 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    source: { type: String, required: true, trim: true, maxlength: 80 },
    referenceId: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      default: "COMPLETED",
      index: true,
    },
    description: { type: String, trim: true, maxlength: 250, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ wallet: 1, createdAt: -1 });
transactionSchema.index({ referenceId: 1, type: 1 });
transactionSchema.statics.CREDIT_TYPES = CREDIT_TYPES;
transactionSchema.statics.DEBIT_TYPES = DEBIT_TYPES;

module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
