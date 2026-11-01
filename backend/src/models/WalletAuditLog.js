const mongoose = require("mongoose");

const walletAuditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "ADMIN_CREDIT",
        "ADMIN_DEBIT",
        "WITHDRAWAL_PROCESSING",
        "WITHDRAWAL_APPROVED",
        "WITHDRAWAL_REJECTED",
        "WITHDRAWAL_CANCELLED",
      ],
    },
    currency: {
      type: String,
      enum: ["VES", "SVES", "GEMS", "TOKENS", "SPINS"],
      default: null,
    },
    amount: { type: Number, min: 0 },
    referenceId: { type: String, default: null, index: true },
    reason: { type: String, trim: true, maxlength: 250, default: "" },
    beforeBalances: { type: mongoose.Schema.Types.Mixed, default: null },
    afterBalances: { type: mongoose.Schema.Types.Mixed, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    requestId: { type: String, default: null },
  },
  { timestamps: true },
);

walletAuditLogSchema.index({ targetUser: 1, createdAt: -1 });
walletAuditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports =
  mongoose.models.WalletAuditLog ||
  mongoose.model("WalletAuditLog", walletAuditLogSchema);
