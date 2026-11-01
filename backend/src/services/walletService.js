const Wallet = require("../models/Wallet");
const walletEngine = require("./walletEngine");
const { createHttpError } = require("../utils/errorHandler");
async function getWalletByUserId(userId) {
  const wallet = await Wallet.findOne({ user: userId }).lean();
  if (!wallet) return walletEngine.getWallet(userId);
  const balances = {},
    reservedBalances = {},
    availableBalances = {};
  for (const currency of walletEngine.CURRENCIES) {
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
async function getWalletSummary(userId) {
  return walletEngine.getSummary(userId);
}
module.exports = {
  getWalletByUserId,
  getWalletSummary,
  getOrCreateWallet: walletEngine.getWallet,
};
