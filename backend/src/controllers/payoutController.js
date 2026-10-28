const payoutService = require("../services/payoutService");

const getUserId = (req) => req.user?.userId || req.user?.id || req.user?._id;

const createPayoutRequest = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { amount, payoutMethod, payoutDetails } = req.body;
    const payout = await payoutService.createPayoutRequest(
      userId,
      amount,
      payoutMethod,
      payoutDetails,
    );

    return res.status(201).json({
      success: true,
      message: "Payout request created successfully",
      data: payout,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyPayouts = async (req, res, next) => {
  try {
    const data = await payoutService.getMyPayouts(
      getUserId(req),
      req.query.page,
      req.query.limit,
    );

    return res.status(200).json({
      success: true,
      message: "Payout history retrieved successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyPayoutById = async (req, res, next) => {
  try {
    const payout = await payoutService.getMyPayoutById(
      getUserId(req),
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message: "Payout retrieved successfully",
      data: payout,
    });
  } catch (error) {
    return next(error);
  }
};

const approvePayout = async (req, res, next) => {
  try {
    const result = await payoutService.approvePayout(
      req.params.id,
      getUserId(req),
    );

    return res.status(200).json({
      success: true,
      message: "Payout approved and wallet debited successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const rejectPayout = async (req, res, next) => {
  try {
    const result = await payoutService.rejectPayout(
      req.params.id,
      getUserId(req),
      req.body?.reason,
    );

    return res.status(200).json({
      success: true,
      message: "Payout rejected successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPayoutRequest,
  getMyPayouts,
  getMyPayoutById,
  approvePayout,
  rejectPayout,
};
