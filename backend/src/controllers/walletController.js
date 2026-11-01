const walletService = require("../services/walletService");
const { validationResult } = require("express-validator");
const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.userId);
    res.json({ success: true, wallet });
  } catch (e) {
    next(e);
  }
};
const getSummary = async (req, res, next) => {
  try {
    const data = await walletService.getWalletSummary(req.user.userId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
module.exports = { getMyWallet, getSummary };
