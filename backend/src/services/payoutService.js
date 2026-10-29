const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const Payout = require("../models/Payout");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatPayout = (payout) => {
  const details = payout.payoutDetails || {};
  let safeDetails = {};

  if (payout.payoutMethod === "UPI") {
    const parts = (details.upiId || "").split("@");

    safeDetails = {
      upiId:
        parts.length === 2 ? `${parts[0].slice(0, 2)}***@${parts[1]}` : "***",
    };
  } else {
    const accountNumber = details.accountNumber || "";

    safeDetails = {
      accountHolderName: details.accountHolderName || "",
      accountNumber: accountNumber ? `****${accountNumber.slice(-4)}` : "",
      ifscCode: details.ifscCode || "",
    };
  }

  return {
    id: payout._id.toString(),
    reference: payout.reference,
    amount: payout.amount,
    payoutMethod: payout.payoutMethod,
    payoutDetails: safeDetails,
    status: payout.status,
    reviewedAt: payout.reviewedAt,
    rejectionReason: payout.rejectionReason,
    createdAt: payout.createdAt,
    updatedAt: payout.updatedAt,
  };
};

const createPayoutRequest = async (
  userId,
  amount,
  payoutMethod,
  payoutDetails,
) => {
  const value = Number(amount);

  if (
    amount === undefined ||
    amount === null ||
    amount === "" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw createError("Payout amount must be greater than zero", 400);
  }

  if (!["UPI", "BANK_TRANSFER"].includes(payoutMethod)) {
    throw createError("Payout method must be UPI or BANK_TRANSFER", 400);
  }

  if (
    !payoutDetails ||
    typeof payoutDetails !== "object" ||
    Array.isArray(payoutDetails)
  ) {
    throw createError("Valid payout details are required", 400);
  }

  let details;

  if (payoutMethod === "UPI") {
    const upiId =
      typeof payoutDetails.upiId === "string" ? payoutDetails.upiId.trim() : "";

    if (!/^[\w.-]{2,256}@[a-zA-Z0-9.-]{2,64}$/.test(upiId)) {
      throw createError("A valid UPI ID is required", 400);
    }

    details = { upiId };
  } else {
    const accountHolderName =
      typeof payoutDetails.accountHolderName === "string"
        ? payoutDetails.accountHolderName.trim()
        : "";

    const accountNumber =
      typeof payoutDetails.accountNumber === "string"
        ? payoutDetails.accountNumber.trim()
        : "";

    const ifscCode =
      typeof payoutDetails.ifscCode === "string"
        ? payoutDetails.ifscCode.trim().toUpperCase()
        : "";

    if (!accountHolderName || accountHolderName.length > 100) {
      throw createError("Valid account holder name is required", 400);
    }

    if (!/^[0-9]{6,30}$/.test(accountNumber)) {
      throw createError("Valid bank account number is required", 400);
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      throw createError("Valid IFSC code is required", 400);
    }

    details = { accountHolderName, accountNumber, ifscCode };
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      // Reserve only if enough unreserved balance is available.
      const wallet = await Wallet.findOneAndUpdate(
        {
          user: userId,
          $expr: {
            $gte: [
              {
                $subtract: ["$balance", { $ifNull: ["$reservedBalance", 0] }],
              },
              value,
            ],
          },
        },
        { $inc: { reservedBalance: value } },
        { new: true, session },
      );

      if (!wallet) {
        const existingWallet = await Wallet.findOne({ user: userId }).session(
          session,
        );

        if (!existingWallet) {
          throw createError("Wallet not found", 404);
        }

        throw createError("Insufficient available wallet balance", 400);
      }

      const [payout] = await Payout.create(
        [
          {
            user: userId,
            wallet: wallet._id,
            amount: value,
            payoutMethod,
            payoutDetails: details,
            status: "pending",
          },
        ],
        { session },
      );

      result = {
        id: payout._id.toString(),
        reference: payout.reference,
        amount: payout.amount,
        currency: wallet.currency,
        payoutMethod: payout.payoutMethod,
        status: payout.status,
        createdAt: payout.createdAt,
        reservedBalance: wallet.reservedBalance,
        availableBalance: wallet.balance - wallet.reservedBalance,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

const getMyPayouts = async (userId, page = 1, limit = 10) => {
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 10));
  const filter = { user: userId };

  const [payouts, total] = await Promise.all([
    Payout.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Payout.countDocuments(filter),
  ]);

  return {
    payouts: payouts.map(formatPayout),
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: currentPage * pageSize < total,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getMyPayoutById = async (userId, payoutId) => {
  if (!mongoose.isValidObjectId(payoutId)) {
    throw createError("Invalid payout ID", 400);
  }

  const payout = await Payout.findOne({
    _id: payoutId,
    user: userId,
  }).lean();

  if (!payout) {
    throw createError("Payout not found", 404);
  }

  return formatPayout(payout);
};

const approvePayout = async (payoutId, adminId) => {
  if (!mongoose.isValidObjectId(payoutId)) {
    throw createError("Invalid payout ID", 400);
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const payout = await Payout.findOne({
        _id: payoutId,
        status: "pending",
      }).session(session);

      if (!payout) {
        const existing = await Payout.findById(payoutId).session(session);

        if (!existing) {
          throw createError("Payout not found", 404);
        }

        throw createError(
          `Payout cannot be approved because its status is '${existing.status}'`,
          409,
        );
      }

      // Consume the reserved funds and reduce the total balance.
      const wallet = await Wallet.findOneAndUpdate(
        {
          _id: payout.wallet,
          balance: { $gte: payout.amount },
          reservedBalance: { $gte: payout.amount },
        },
        {
          $inc: {
            balance: -payout.amount,
            reservedBalance: -payout.amount,
          },
        },
        { new: true, session },
      );

      if (!wallet) {
        throw createError("Wallet or reserved balance is insufficient", 409);
      }

      payout.status = "approved";
      payout.reviewedBy = adminId;
      payout.reviewedAt = new Date();
      payout.rejectionReason = null;

      await payout.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            user: payout.user,
            wallet: payout.wallet,
            type: "debit",
            amount: payout.amount,
            description: `Payout approved: ${payout.reference}`,
            status: "completed",
            reference: randomUUID(),
          },
        ],
        { session },
      );

      result = {
        payout: formatPayout(payout.toObject()),
        walletBalance: wallet.balance,
        reservedBalance: wallet.reservedBalance,
        availableBalance: wallet.balance - wallet.reservedBalance,
        transactionReference: transaction.reference,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

const rejectPayout = async (payoutId, adminId, reason) => {
  if (!mongoose.isValidObjectId(payoutId)) {
    throw createError("Invalid payout ID", 400);
  }

  if (typeof reason !== "string" || !reason.trim()) {
    throw createError("A rejection reason is required", 400);
  }

  const cleanReason = reason.trim();

  if (cleanReason.length > 250) {
    throw createError("Rejection reason cannot exceed 250 characters", 400);
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const payout = await Payout.findOne({
        _id: payoutId,
        status: "pending",
      }).session(session);

      if (!payout) {
        const existing = await Payout.findById(payoutId).session(session);

        if (!existing) {
          throw createError("Payout not found", 404);
        }

        throw createError(
          `Payout cannot be rejected because its status is '${existing.status}'`,
          409,
        );
      }

      // Release the reserved amount without changing total balance.
      const wallet = await Wallet.findOneAndUpdate(
        {
          _id: payout.wallet,
          reservedBalance: { $gte: payout.amount },
        },
        { $inc: { reservedBalance: -payout.amount } },
        { new: true, session },
      );

      if (!wallet) {
        throw createError("Reserved wallet balance is insufficient", 409);
      }

      payout.status = "rejected";
      payout.reviewedBy = adminId;
      payout.reviewedAt = new Date();
      payout.rejectionReason = cleanReason;

      await payout.save({ session });

      result = {
        payout: formatPayout(payout.toObject()),
        walletBalance: wallet.balance,
        reservedBalance: wallet.reservedBalance,
        availableBalance: wallet.balance - wallet.reservedBalance,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createPayoutRequest,
  getMyPayouts,
  getMyPayoutById,
  approvePayout,
  rejectPayout,
};
