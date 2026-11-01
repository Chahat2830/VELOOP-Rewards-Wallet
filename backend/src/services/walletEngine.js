const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { createHttpError } = require("../utils/errorHandler");

const CURRENCIES = ["VES", "SVES", "GEMS", "TOKENS", "SPINS"];

function assertCurrency(currency) {
  if (!CURRENCIES.includes(currency))
    throw createHttpError("Unsupported wallet currency", 400);
}
function serializeWallet(wallet) {
  const balances = {},
    reservedBalances = {},
    availableBalances = {};
  for (const currency of CURRENCIES) {
    balances[currency] = wallet.balances?.[currency] || 0;
    reservedBalances[currency] = wallet.reservedBalances?.[currency] || 0;
    availableBalances[currency] =
      balances[currency] - reservedBalances[currency];
  }
  return {
    id: String(wallet._id),
    userId: String(wallet.user),
    balances,
    reservedBalances,
    availableBalances,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}
async function getOrCreateWallet(userId, session) {
  let query = Wallet.findOne({ user: userId });
  if (session) query = query.session(session);
  let wallet = await query;
  if (!wallet) {
    try {
      const [created] = await Wallet.create(
        [{ user: userId }],
        session ? { session } : {},
      );
      wallet = created;
    } catch (error) {
      if (error.code !== 11000) throw error;
      let retry = Wallet.findOne({ user: userId });
      if (session) retry = retry.session(session);
      wallet = await retry;
      if (!wallet) throw error;
    }
  }
  return wallet;
}
async function getWallet(userId) {
  return serializeWallet(await getOrCreateWallet(userId));
}
async function applyTransaction({
  actorId,
  userId,
  currency,
  type,
  amount,
  source,
  description = "",
  referenceId = null,
  metadata = {},
  idempotencyKey,
}) {
  assertCurrency(currency);
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0)
    throw createHttpError("Amount must be greater than zero", 400);
  if (!idempotencyKey || typeof idempotencyKey !== "string")
    throw createHttpError("Idempotency key is required", 400);
  const isCredit = Transaction.CREDIT_TYPES.includes(type);
  const isDebit = Transaction.DEBIT_TYPES.includes(type);
  if (!isCredit && !isDebit)
    throw createHttpError("Invalid transaction type", 400);

  const fingerprint = JSON.stringify({
    currency,
    type,
    amount: value,
    source,
    referenceId: referenceId || null,
  });
  const session = await mongoose.startSession();
  try {
    let output;
    await session.withTransaction(async () => {
      const prior = await Transaction.findOne({
        user: userId,
        idempotencyKey,
      }).session(session);
      if (prior) {
        const priorFingerprint = JSON.stringify({
          currency: prior.currency,
          type: prior.type,
          amount: prior.amount,
          source: prior.source,
          referenceId: prior.referenceId || null,
        });
        if (priorFingerprint !== fingerprint)
          throw createHttpError(
            "Idempotency key already used for a different transaction",
            409,
          );
        output = {
          wallet: serializeWallet(
            await Wallet.findById(prior.wallet).session(session),
          ),
          transaction: prior,
          duplicate: true,
        };
        return;
      }

      const wallet = await getOrCreateWallet(userId, session);
      const before = wallet.balances[currency] || 0;
      const reserved = wallet.reservedBalances[currency] || 0;
      if (isDebit && before - reserved < value)
        throw createHttpError(
          `Insufficient available ${currency} balance`,
          400,
        );
      const after = isCredit ? before + value : before - value;
      wallet.balances[currency] = after;
      await wallet.save({ session });

      const [ledger] = await Transaction.create(
        [
          {
            transactionId: randomUUID(),
            idempotencyKey,
            user: userId,
            wallet: wallet._id,
            currency,
            type,
            amount: value,
            balanceBefore: before,
            balanceAfter: after,
            source,
            referenceId,
            status: "COMPLETED",
            description,
            metadata,
            performedBy: actorId || userId,
          },
        ],
        { session },
      );

      if (actorId && String(actorId) !== String(userId)) {
        const { recordWalletAudit } = require("./auditService");
        await recordWalletAudit(
          {
            actor: actorId,
            targetUser: userId,
            wallet: wallet._id,
            action: isCredit ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
            currency,
            amount: value,
            referenceId: ledger.transactionId,
            reason: description,
            beforeBalances: { [currency]: before },
            afterBalances: { [currency]: after },
            metadata,
          },
          session,
        );
      }
      output = {
        wallet: serializeWallet(wallet),
        transaction: ledger,
        duplicate: false,
      };
    });
    return output;
  } catch (error) {
    if (error.code === 11000) {
      const prior = await Transaction.findOne({ user: userId, idempotencyKey });
      if (prior) {
        const priorFingerprint = JSON.stringify({
          currency: prior.currency,
          type: prior.type,
          amount: prior.amount,
          source: prior.source,
          referenceId: prior.referenceId || null,
        });
        if (priorFingerprint !== fingerprint)
          throw createHttpError(
            "Idempotency key already used for a different transaction",
            409,
          );
        const wallet = await Wallet.findById(prior.wallet);
        return {
          wallet: serializeWallet(wallet),
          transaction: prior,
          duplicate: true,
        };
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }
}
async function getSummary(userId) {
  const wallet = await getOrCreateWallet(userId);
  const totals = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: { currency: "$currency", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);
  return {
    wallet: serializeWallet(wallet),
    activity: totals.map((x) => ({
      currency: x._id.currency,
      type: x._id.type,
      total: x.total,
      count: x.count,
    })),
  };
}
module.exports = {
  CURRENCIES,
  getWallet,
  getSummary,
  applyTransaction,
  serializeWallet,
  getOrCreateWallet,
};
