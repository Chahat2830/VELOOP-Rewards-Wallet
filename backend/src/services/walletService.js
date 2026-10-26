const Wallet = require("../models/Wallet");

const getWalletByUserId = async (userId) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    const error = new Error("Wallet not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: wallet._id.toString(),
    userId: wallet.user.toString(),
    balance: wallet.balance,
    currency: wallet.currency,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
};

module.exports = {
  getWalletByUserId,
};
