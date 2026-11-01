const mongoose = require("mongoose");
const { createHash, randomUUID } = require("crypto");
const Withdrawal = require("../models/Withdrawal");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const walletEngine = require("./walletEngine");
const { createHttpError } = require("../utils/errorHandler");
const { recordWalletAudit } = require("./auditService");

const fingerprint = (data) =>
  createHash("sha256").update(JSON.stringify(data)).digest("hex");
const formatWithdrawal = (w) => ({
  id: String(w._id),
  withdrawalId: w.withdrawalId,
  currency: w.currency,
  amount: w.amount,
  payoutMethod: w.payoutMethod,
  payoutDetails:
    w.payoutMethod === "UPI"
      ? {
          upiId: (w.payoutDetails?.upiId || "").replace(
            /^(.{2}).*(@.*)$/,
            "$1***$2",
          ),
        }
      : {
          accountHolderName: w.payoutDetails?.accountHolderName || "",
          accountNumber: `****${String(w.payoutDetails?.accountNumber || "").slice(-4)}`,
          ifscCode: w.payoutDetails?.ifscCode || "",
        },
  status: w.status,
  rejectionReason: w.rejectionReason,
  reviewedAt: w.reviewedAt,
  createdAt: w.createdAt,
  updatedAt: w.updatedAt,
});
function normalizeDetails(method, details) {
  if (!details || typeof details !== "object" || Array.isArray(details))
    throw createHttpError("Payout details are required", 400);
  if (method === "UPI") {
    const upiId = String(details.upiId || "").trim();
    if (!/^[\w.-]{2,256}@[a-zA-Z0-9.-]{2,64}$/.test(upiId))
      throw createHttpError("A valid UPI ID is required", 400);
    return { upiId };
  }
  const accountHolderName = String(details.accountHolderName || "").trim();
  const accountNumber = String(details.accountNumber || "").trim();
  const ifscCode = String(details.ifscCode || "")
    .trim()
    .toUpperCase();
  if (accountHolderName.length < 2 || accountHolderName.length > 100)
    throw createHttpError("Valid account holder name is required", 400);
  if (!/^[0-9]{6,30}$/.test(accountNumber))
    throw createHttpError("Valid bank account number is required", 400);
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode))
    throw createHttpError("Valid IFSC code is required", 400);
  return { accountHolderName, accountNumber, ifscCode };
}
async function createPayoutRequest(
  userId,
  { amount, payoutMethod, payoutDetails, idempotencyKey },
) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0)
    throw createHttpError("Withdrawal amount must be greater than zero", 400);
  if (!["UPI", "BANK_TRANSFER"].includes(payoutMethod))
    throw createHttpError("Unsupported payout method", 400);
  if (!idempotencyKey || typeof idempotencyKey !== "string")
    throw createHttpError("Idempotency key is required", 400);
  const details = normalizeDetails(payoutMethod, payoutDetails);
  const requestFingerprint = fingerprint({
    amount: value,
    payoutMethod,
    payoutDetails: details,
    currency: "VES",
  });
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await Withdrawal.findOne({
        user: userId,
        idempotencyKey,
      }).session(session);
      if (existing) {
        if (existing.requestFingerprint !== requestFingerprint)
          throw createHttpError(
            "Idempotency key already used for a different withdrawal request",
            409,
          );
        result = { withdrawal: formatWithdrawal(existing), duplicate: true };
        return;
      }
      const wallet = await Wallet.findOne({ user: userId }).session(session);
      if (!wallet) throw createHttpError("Wallet not found", 404);
      const before = wallet.balances.VES || 0;
      const reserved = wallet.reservedBalances.VES || 0;
      if (before - reserved < value)
        throw createHttpError("Insufficient VES balance", 400);
      wallet.reservedBalances.VES = reserved + value;
      await wallet.save({ session });
      const [withdrawal] = await Withdrawal.create(
        [
          {
            user: userId,
            wallet: wallet._id,
            currency: "VES",
            amount: value,
            payoutMethod,
            payoutDetails: details,
            idempotencyKey,
            requestFingerprint,
          },
        ],
        { session },
      );
      result = {
        withdrawal: formatWithdrawal(withdrawal),
        wallet: walletEngine.serializeWallet(wallet),
        duplicate: false,
      };
    });
    return result;
  } catch (error) {
    if (error.code === 11000) {
      const existing = await Withdrawal.findOne({
        user: userId,
        idempotencyKey,
      });
      if (existing) {
        if (existing.requestFingerprint !== requestFingerprint)
          throw createHttpError(
            "Idempotency key already used for a different withdrawal request",
            409,
          );
        return { withdrawal: formatWithdrawal(existing), duplicate: true };
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }
}
async function getMyPayouts(userId, page = 1, limit = 10) {
  const p = Math.max(1, parseInt(page, 10) || 1),
    l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const [items, total] = await Promise.all([
    Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Withdrawal.countDocuments({ user: userId }),
  ]);
  return {
    withdrawals: items.map(formatWithdrawal),
    pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
  };
}
async function getMyPayoutById(userId, id) {
  if (!mongoose.isValidObjectId(id))
    throw createHttpError("Invalid withdrawal ID", 400);
  const item = await Withdrawal.findOne({ _id: id, user: userId }).lean();
  if (!item) throw createHttpError("Withdrawal not found", 404);
  return formatWithdrawal(item);
}

async function transitionWithdrawal(id, adminId, action, reason = "") {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError("Invalid withdrawal ID", 400);
  }

  const allowed = {
    PROCESSING: ["PENDING"],
    APPROVED: ["PROCESSING", "PENDING"],
    REJECTED: ["PENDING", "PROCESSING"],
  };

  if (!allowed[action]) {
    throw createHttpError("Unsupported withdrawal transition", 400);
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const item = await Withdrawal.findOne({
        _id: id,
        status: { $in: allowed[action] },
      }).session(session);

      if (!item) {
        throw createHttpError(
          "Withdrawal not found or transition is not allowed",
          409,
        );
      }

      const wallet = await Wallet.findById(item.wallet).session(session);

      if (!wallet) {
        throw createHttpError("Wallet not found", 404);
      }

      const before = wallet.balances.VES || 0;
      const reservedBefore = wallet.reservedBalances.VES || 0;

      // Processing must preserve the reservation.
      if (action !== "PROCESSING") {
        if (reservedBefore < item.amount) {
          throw createHttpError("Reserved VES balance is inconsistent", 409);
        }

        // Both approval and rejection release the reservation.
        wallet.reservedBalances.VES = reservedBefore - item.amount;
      }

      if (action === "APPROVED") {
        if (before < item.amount) {
          throw createHttpError("Wallet balance is inconsistent", 409);
        }

        wallet.balances.VES = before - item.amount;

        await Transaction.create(
          [
            {
              transactionId: randomUUID(),
              idempotencyKey: `withdrawal:${item.withdrawalId}`,
              user: item.user,
              wallet: wallet._id,
              currency: "VES",
              type: "WITHDRAWAL",
              amount: item.amount,
              balanceBefore: before,
              balanceAfter: wallet.balances.VES,
              source: "WITHDRAWAL",
              referenceId: item.withdrawalId,
              status: "COMPLETED",
              description: `Withdrawal ${item.withdrawalId} approved`,
              performedBy: adminId,
            },
          ],
          { session },
        );
      }

      await wallet.save({ session });

      item.status = action;
      item.reviewedBy = adminId;
      item.reviewedAt = new Date();
      item.rejectionReason =
        action === "REJECTED" ? String(reason).trim() : null;

      await item.save({ session });

      await recordWalletAudit(
        {
          actor: adminId,
          targetUser: item.user,
          wallet: wallet._id,
          action: `WITHDRAWAL_${action}`,
          currency: "VES",
          amount: item.amount,
          referenceId: item.withdrawalId,
          reason: item.rejectionReason || "",
          beforeBalances: {
            VES: before,
            reservedVES: reservedBefore,
          },
          afterBalances: {
            VES: wallet.balances.VES,
            reservedVES: wallet.reservedBalances.VES,
          },
        },
        session,
      );

      result = {
        withdrawal: formatWithdrawal(item),
        wallet: walletEngine.serializeWallet(wallet),
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  createPayoutRequest,
  getMyPayouts,
  getMyPayoutById,
  processPayout: (id, adminId) =>
    transitionWithdrawal(id, adminId, "PROCESSING"),
  approvePayout: (id, adminId) => transitionWithdrawal(id, adminId, "APPROVED"),
  rejectPayout: (id, adminId, reason) =>
    transitionWithdrawal(id, adminId, "REJECTED", reason),
};
