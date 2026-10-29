const Wallet = require("../models/Wallet");

const getWalletByUserId = async (userId) => {
  const wallet = await Wallet.findOne({ user: userId }).lean();

  if (!wallet) {
    const error = new Error("Wallet not found");
    error.statusCode = 404;
    throw error;
  }

  const reservedBalance = wallet.reservedBalance || 0;

  return {
    id: wallet._id.toString(),
    userId: wallet.user.toString(),
    balance: wallet.balance,
    reservedBalance,
    availableBalance: wallet.balance - reservedBalance,
    currency: wallet.currency,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
};

module.exports = { getWalletByUserId };
