const service = require("../services/transactionService");
const { validationResult } = require("express-validator");

function check(req, res) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ success: false, errors: result.array() });
    return false;
  }
  return true;
}
const getTransactionHistory = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.getTransactionHistory(
      req.user.userId,
      req.query.page,
      req.query.limit,
      req.query.currency,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
const creditWallet = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.creditWallet(req.user.userId, req.body);
    res.status(data.duplicate ? 200 : 201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
const debitWallet = async (req, res, next) => {
  try {
    if (!check(req, res)) return;
    const data = await service.debitWallet(req.user.userId, req.body);
    res.status(data.duplicate ? 200 : 201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
module.exports = { getTransactionHistory, creditWallet, debitWallet };
