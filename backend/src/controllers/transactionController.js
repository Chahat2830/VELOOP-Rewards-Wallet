const transactionService = require("../services/transactionService");

const getUserId = (req) => req.user?.userId || req.user?.id || req.user?._id;

const getTransactionHistory = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = await transactionService.getTransactionHistory(
      userId,
      req.query.page,
      req.query.limit,
    );

    return res.status(200).json({
      success: true,
      message: "Transaction history retrieved successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const creditWallet = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const result = await transactionService.creditWallet(
      getUserId(req),
      amount,
      description,
    );

    return res.status(200).json({
      success: true,
      message: "Wallet credited successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const debitWallet = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const result = await transactionService.debitWallet(
      getUserId(req),
      amount,
      description,
    );

    return res.status(200).json({
      success: true,
      message: "Wallet debited successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTransactionHistory,
  creditWallet,
  debitWallet,
};
