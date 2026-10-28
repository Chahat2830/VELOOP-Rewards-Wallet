const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

// Create errors with HTTP status codes
const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Get paginated transaction history
const getTransactionHistory = async (userId, page = 1, limit = 10) => {
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));

  const filter = { user: userId };
  const skip = (currentPage - 1) * pageSize;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .select("type amount description status reference createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: skip + transactions.length < total,
      hasPreviousPage: currentPage > 1,
    },
  };
};

// Credit wallet
const creditWallet = async (userId, amount, description = "Wallet credit") => {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw createHttpError("Amount must be greater than zero", 400);
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const wallet = await Wallet.findOne({ user: userId }).session(session);

      if (!wallet) {
        throw createHttpError("Wallet not found", 404);
      }

      const updatedWallet = await Wallet.findOneAndUpdate(
        { _id: wallet._id },
        { $inc: { balance: value } },
        { new: true, session },
      );

      const [transaction] = await Transaction.create(
        [
          {
            user: userId,
            wallet: wallet._id,
            type: "credit",
            amount: value,
            description,
            status: "completed",
            reference: randomUUID(),
          },
        ],
        { session },
      );

      result = { wallet: updatedWallet, transaction };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

// Debit wallet
const debitWallet = async (userId, amount, description = "Wallet debit") => {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    throw createHttpError("Amount must be greater than zero", 400);
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const wallet = await Wallet.findOneAndUpdate(
        { user: userId, balance: { $gte: value } },
        { $inc: { balance: -value } },
        { new: true, session },
      );

      if (!wallet) {
        const existingWallet = await Wallet.findOne({
          user: userId,
        }).session(session);

        if (!existingWallet) {
          throw createHttpError("Wallet not found", 404);
        }

        throw createHttpError("Insufficient wallet balance", 400);
      }

      const [transaction] = await Transaction.create(
        [
          {
            user: userId,
            wallet: wallet._id,
            type: "debit",
            amount: value,
            description,
            status: "completed",
            reference: randomUUID(),
          },
        ],
        { session },
      );

      result = { wallet, transaction };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getTransactionHistory,
  creditWallet,
  debitWallet,
};
