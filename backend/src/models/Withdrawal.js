const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const withdrawalSchema = new mongoose.Schema(
  {
    withdrawalId: {
      type: String,
      default: () => randomUUID(),
      unique: true,
      index: true,
    },
    idempotencyKey: { type: String, required: true, trim: true },
    requestFingerprint: { type: String, required: true },
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
    },
    currency: { type: String, enum: ["VES"], default: "VES", required: true },
    amount: { type: Number, required: true, min: 0.000001 },
    payoutMethod: {
      type: String,
      enum: ["UPI", "BANK_TRANSFER"],
      required: true,
    },
    payoutDetails: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 250,
      default: null,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

withdrawalSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });
withdrawalSchema.index({ user: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: 1 });

module.exports =
  mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);
