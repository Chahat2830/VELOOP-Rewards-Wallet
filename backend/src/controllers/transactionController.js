const transactionService = require("../services/transactionService");

const creditWallet = async (req, res, next) => {
  try {
    const result = await transactionService.creditWallet({
      userId: req.user.userId,
      amount: req.body.amount,
      description: req.body.description,
    });

    return res.status(201).json({
      success: true,
      message: "Wallet credited successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const debitWallet = async (req, res, next) => {
  try {
    const result = await transactionService.debitWallet({
      userId: req.user.userId,
      amount: req.body.amount,
      description: req.body.description,
    });

    return res.status(201).json({
      success: true,
      message: "Wallet debited successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  creditWallet,
  debitWallet,
};
