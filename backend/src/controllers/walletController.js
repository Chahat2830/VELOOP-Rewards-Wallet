const walletService = require("../services/walletService");

const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Wallet retrieved successfully",
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyWallet,
};
