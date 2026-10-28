const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const payoutSchema = new mongoose.Schema(
  {
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

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Payout amount must be greater than zero"],
    },

    payoutMethod: {
      type: String,
      enum: ["UPI", "BANK_TRANSFER"],
      required: true,
    },

    payoutDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
      index: true,
    },

    reference: {
      type: String,
      default: () => randomUUID(),
      unique: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 250,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

payoutSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Payout", payoutSchema);
