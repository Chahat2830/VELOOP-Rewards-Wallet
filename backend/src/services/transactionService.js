const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

// Validate transaction amount
const validateAmount = (amount) => {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    const error = new Error("Amount must be a number greater than zero");
    error.statusCode = 400;
    throw error;
  }

  // Keep amounts to two decimal places
  const roundedAmount = Math.round(amount * 100) / 100;

  if (roundedAmount <= 0) {
    const error = new Error("Amount must be at least 0.01");
    error.statusCode = 400;
    throw error;
  }

  return roundedAmount;
};

// Credit or debit a user's wallet
const createTransaction = async ({
  userId,
  type,
  amount,
  description = "",
}) => {
  if (!["credit", "debit"].includes(type)) {
    const error = new Error("Transaction type must be credit or debit");
    error.statusCode = 400;
    throw error;
  }

  const validAmount = validateAmount(amount);

  const session = await mongoose.startSession();

  let result;

  try {
    await session.withTransaction(async () => {
      // Find the authenticated user's wallet
      const wallet = await Wallet.findOne({ user: userId }).session(session);

      if (!wallet) {
        const error = new Error("Wallet not found");
        error.statusCode = 404;
        throw error;
      }

      let updatedWallet;

      if (type === "credit") {
        // Atomically add funds
        updatedWallet = await Wallet.findOneAndUpdate(
          { _id: wallet._id },
          { $inc: { balance: validAmount } },
          { new: true, session },
        );
      } else {
        // Atomically deduct only if sufficient funds are available
        updatedWallet = await Wallet.findOneAndUpdate(
          {
            _id: wallet._id,
            balance: { $gte: validAmount },
          },
          { $inc: { balance: -validAmount } },
          { new: true, session },
        );

        if (!updatedWallet) {
          const error = new Error("Insufficient wallet balance");
          error.statusCode = 400;
          throw error;
        }
      }

      // Save the transaction record
      const [transaction] = await Transaction.create(
        [
          {
            wallet: updatedWallet._id,
            user: userId,
            type,
            amount: validAmount,
            description,
            status: "completed",
            reference: randomUUID(),
          },
        ],
        { session },
      );

      result = {
        transaction: {
          id: transaction._id.toString(),
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          reference: transaction.reference,
          createdAt: transaction.createdAt,
        },
        wallet: {
          id: updatedWallet._id.toString(),
          balance: updatedWallet.balance,
          currency: updatedWallet.currency,
        },
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

// Add money to wallet
const creditWallet = async ({ userId, amount, description }) => {
  return createTransaction({
    userId,
    type: "credit",
    amount,
    description,
  });
};

// Deduct money from wallet
const debitWallet = async ({ userId, amount, description }) => {
  return createTransaction({
    userId,
    type: "debit",
    amount,
    description,
  });
};

module.exports = {
  creditWallet,
  debitWallet,
};
