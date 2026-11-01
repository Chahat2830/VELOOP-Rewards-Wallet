const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const walletEngine = require("./walletEngine");
const { createHttpError } = require("../utils/errorHandler");

async function getTransactionHistory(userId, page = 1, limit = 10, currency) {
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
  const filter = { user: userId };
  if (currency) filter.currency = currency;
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((currentPage - 1) * pageSize)
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
      hasNextPage: currentPage * pageSize < total,
      hasPreviousPage: currentPage > 1,
    },
  };
}

async function adminTransaction(actorId, payload, expectedTypes) {
  const { targetUserId, ...transaction } = payload;
  if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) {
    throw createHttpError("A valid targetUserId is required", 400);
  }
  if (!expectedTypes.includes(transaction.type))
    throw createHttpError("Invalid transaction type for this operation", 400);
  return walletEngine.applyTransaction({
    actorId,
    userId: targetUserId,
    ...transaction,
  });
}
async function creditWallet(actorId, payload) {
  return adminTransaction(actorId, payload, Transaction.CREDIT_TYPES);
}
async function debitWallet(actorId, payload) {
  return adminTransaction(actorId, payload, Transaction.DEBIT_TYPES);
}
module.exports = { getTransactionHistory, creditWallet, debitWallet };
